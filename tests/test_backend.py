"""Offline smoke tests: no AWS account, video model or credentials needed."""
import io
import json
import os
import sys
from pathlib import Path

os.environ['AWS_EC2_METADATA_DISABLED'] = 'true'
os.environ['ROADGUARD_DEMO_CODE'] = 'unit-test-secret'
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))

from fastapi.testclient import TestClient
from botocore.exceptions import ClientError
import backend.main as backend

class FakeS3:
    def __init__(self):
        self.objects={}
        self.calls=[]
    def put_object(self, *, Bucket, Key, Body, **kw):
        self.objects[Key] = Body
        self.calls.append(('put',Key))
    def upload_file(self, path, bucket, key, ExtraArgs=None):
        self.objects[key]=Path(path).read_bytes()
        self.calls.append(('upload',key))
    def get_object(self, *, Bucket, Key):
        if Key not in self.objects:
            raise ClientError({'Error':{'Code':'NoSuchKey','Message':'Missing'}},'GetObject')
        return {'Body':io.BytesIO(self.objects[Key])}


def test_health_and_auth(monkeypatch):
    api=TestClient(backend.app)
    assert api.get('/api/health').status_code==200
    assert api.get('/api/runs/roadguard-run-001').status_code==401
    assert api.get('/').status_code==200
    assert 'OUR INNOVATIONS' in api.get('/').text


def test_publish_uploads_json_last(tmp_path,monkeypatch):
    fake=FakeS3();monkeypatch.setattr(backend,'s3',fake)
    root=tmp_path
    monkeypatch.setattr(backend,'ROOT',root)
    run='20261026T123456Z-testing'
    folder=root/'runtime'/run/'agent_output'/'evidence'; folder.mkdir(parents=True)
    images=[]
    for kind in ['original','annotated']:
        path=folder/f'event_001_{kind}.jpg';path.write_bytes(b'fake-image')
        images.append(str(path))
    video=root/'upload.mp4';video.write_bytes(b'fake-video')
    trace=folder.parent/'inspection_trace.json'
    trace.write_text(json.dumps({'events':[{'event_id':1,'evidence':{'original':images[0],'annotated':images[1]}}]}))
    assert backend.publish(run,video,trace)==1
    assert fake.calls[-1]==('put',f'incoming/{run}/inspection_trace.json')
    report=json.loads(fake.objects[f'incoming/{run}/inspection_trace.json'])
    assert report['events'][0]['evidence']['annotated'].startswith('s3://roadguard-ai-mumbai-2026-123/incoming/')
    assert len(fake.calls)==4  # original video + 2 images + JSON


def test_existing_cloud_report_and_review(monkeypatch):
    fake=FakeS3();monkeypatch.setattr(backend,'s3',fake)
    run='roadguard-run-001'
    raw={'events':[{'event_id':4,'evidence':{'original':f's3://{backend.BUCKET}/incoming/{run}/evidence/a.jpg','annotated':f's3://{backend.BUCKET}/incoming/{run}/evidence/b.jpg'}}]}
    summary={'candidate_events':1,'review_queue':[{'event_id':4,'class_name':'LONGITUDINAL_CRACK','status':'candidate_for_human_review'}]}
    fake.objects[f'incoming/{run}/inspection_trace.json']=json.dumps(raw).encode()
    fake.objects[f'reports/{run}/review_summary.json']=json.dumps(summary).encode()
    fake.objects[f'incoming/{run}/evidence/a.jpg']=b'jpg-test'
    cli=TestClient(backend.app);headers={'X-Roadguard-Code':'unit-test-secret'}
    r=cli.get(f'/api/runs/{run}',headers=headers)
    assert r.status_code==200 and r.json()['summary']['candidate_events']==1
    assert cli.get(f'/api/runs/{run}/evidence/4/original',headers=headers).content==b'jpg-test'
    rr=cli.post(f'/api/runs/{run}/review',headers=headers,json={'event_id':4,'decision':'confirmed','note':'Checked original frame'})
    assert rr.status_code==200
    rr=cli.get(f'/api/runs/{run}',headers=headers).json()
    assert rr['decisions']['4']['decision']=='confirmed'
    assert len(rr['review_history'])==1

class FakePaginator:
    def __init__(self, store): self.store = store
    def paginate(self, **kw):
        prefixes = sorted({key.split('/')[1] for key in self.store if key.startswith('reports/') and len(key.split('/')) > 2})
        return [{'CommonPrefixes': [{'Prefix': f'reports/{run_id}/'} for run_id in prefixes]}]


def test_inspection_history_and_access(monkeypatch):
    fake = FakeS3()
    fake.get_paginator = lambda operation: FakePaginator(fake.objects)
    monkeypatch.setattr(backend, 's3', fake)
    headers = {'X-Roadguard-Code': 'unit-test-secret'}
    for rid, ts, n in [('roadguard-run-001', '2026-10-26T22:30:00+00:00', 6),
                       ('20261027T004335Z-e290f3d', '2026-10-27T00:50:00+00:00', 2)]:
        queue = [{'event_id': i+1} for i in range(n)]
        fake.objects[f'reports/{rid}/review_summary.json'] = json.dumps({
            'candidate_events': n, 'review_queue': queue, 'generated_at_utc': ts,
            'status_counts': {'candidate_for_human_review': n}
        }).encode()
        fake.objects[f'incoming/{rid}/inspection_trace.json'] = json.dumps({
            'source_filename': 'road_test.mp4', 'events': []
        }).encode()
    fake.objects['reviews/roadguard-run-001/decisions.json'] = json.dumps({
        'decisions': {'1': {'decision': 'confirmed'}, '3': {'decision': 'rejected'}}
    }).encode()
    api = TestClient(backend.app)
    assert api.get('/api/access').status_code == 401
    assert api.get('/api/access', headers=headers).json() == {'authenticated': True}
    assert api.get('/api/runs').status_code == 401
    r = api.get('/api/runs', headers=headers)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data['count'] == 2
    assert data['runs'][0]['run_id'] == '20261027T004335Z-e290f3d'
    old = next(x for x in data['runs'] if x['run_id'] == 'roadguard-run-001')
    assert old['reviewed_events'] == 2
    assert old['review_status'] == 'Partially reviewed'
    assert old['filename'] == 'road_test.mp4'

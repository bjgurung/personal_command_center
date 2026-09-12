import assert from 'node:assert/strict';
import {matchesCloudDraft,workspaceFingerprint} from '../lib/workspace-recovery.ts';
const cloud={transactions:[{amount:500000,vendor:'XYZ'}],revision:1};
assert.equal(matchesCloudDraft('{"revision":1,"transactions":[{"vendor":"XYZ","amount":500000}]}',cloud),true);
assert.equal(matchesCloudDraft('{"transactions":[{"amount":50,"vendor":"XYZ"}],"revision":1}',cloud),false);
assert.equal(matchesCloudDraft('broken',cloud),false);
assert.notEqual(workspaceFingerprint([1,2]),workspaceFingerprint([2,1]));
console.log('PASS recovery equality, distinct drafts, malformed drafts and array order');

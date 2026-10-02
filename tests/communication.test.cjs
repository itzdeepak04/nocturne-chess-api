const {test}=require('node:test');const assert=require('node:assert/strict');
require('reflect-metadata');
const {CommunicationService}=require('../dist/modules/communication/services/communication.service');
function setup(settings={}){
 const match={white:'white',black:'black',status:'active'},entries=[];
 const matches={get:async user=>{if(!['white','black'].includes(user))throw Error('Forbidden');return match;}};
 const dao={append:async entry=>{entries.push(entry);return entry;},list:async(id,kind,recipient)=>entries.filter(e=>e.kind===kind&&(!recipient||e.recipient===recipient))};
 return {match,entries,service:new CommunicationService(matches,dao,{get:key=>settings[key]})};
}
test('chat is trimmed and restricted to match participants while active',async()=>{
 const {service,match,entries}=setup();
 await assert.rejects(service.sendMessage('outsider','match',{text:'spam'}));
 await assert.rejects(service.sendMessage('white','match',{text:'  '}));
 await service.sendMessage('white','match',{text:' Good luck! ',clientId:'one'});
 assert.equal(entries[0].content,'Good luck!');
 match.status='finished';
 await assert.rejects(service.sendMessage('white','match',{text:'late'}));
 assert.equal((await service.messages('black','match')).length,1);
});
test('managed TURN credentials are returned unchanged with every configured transport',async()=>{
 const {service}=setup({TURN_URLS:' turn:relay.example:80, ,turn:relay.example:80?transport=tcp,turns:relay.example:443?transport=tcp ',TURN_USERNAME:'test-user',TURN_PASSWORD:'test-password',TURN_SECRET:'unused-secret'});
 const config=await service.config('white','match');
 assert.equal(config.relayAvailable,true);
 assert.deepEqual(config.iceServers[1],{urls:['turn:relay.example:80','turn:relay.example:80?transport=tcp','turns:relay.example:443?transport=tcp'],username:'test-user',credential:'test-password'});
 assert.equal(config.iceServers.length,2);
});
test('Coturn continues to issue signed short-lived credentials',async()=>{
 const {service}=setup({TURN_URLS:'turn:relay.example:3478',TURN_SECRET:'test-secret'});
 const config=await service.config('black','match'),relay=config.iceServers[1];
 assert.equal(config.relayAvailable,true);
 assert.match(relay.username,/^\d+:black$/);
 const remaining=Number(relay.username.split(':')[0])-Math.floor(Date.now()/1000);
 assert.ok(remaining>=3599&&remaining<=3600);
 assert.equal(relay.credential,require('node:crypto').createHmac('sha1','test-secret').update(relay.username).digest('base64'));
});
test('missing or incomplete relay settings retain STUN-only configuration',async()=>{
 for(const settings of [{},{TURN_URLS:'turn:relay.example:80',TURN_USERNAME:'user'},{TURN_URLS:'turn:relay.example:80',TURN_PASSWORD:'password'},{TURN_USERNAME:'user',TURN_PASSWORD:'password'}]){
  const config=await setup(settings).service.config('white','match');
  assert.equal(config.relayAvailable,false);assert.equal(config.iceServers.length,1);
 }
});
test('voice credentials require an active match and an authorized participant',async()=>{
 const {service,match}=setup({TURN_URLS:'turn:relay.example:80',TURN_USERNAME:'user',TURN_PASSWORD:'password'});
 await assert.rejects(service.config('outsider','match'));
 match.status='finished';await assert.rejects(service.config('white','match'));
});
test('voice signal recipient is derived from the match and signals expire',async()=>{
 const {service,entries}=setup();
 await service.sendSignal('white','match',{payload:JSON.stringify({kind:'ready',session:'session'}),clientId:'one'});
 assert.equal(entries[0].recipient,'black');
 assert.ok(entries[0].expiresAt.getTime()-Date.now()<=120000);
 assert.equal((await service.signals('white','match')).length,0);
 assert.equal((await service.signals('black','match')).length,1);
 await assert.rejects(service.sendSignal('white','match',{payload:'not json'}));
 await assert.rejects(service.sendSignal('outsider','match',{payload:'{}'}));
});

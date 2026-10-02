const {test}=require('node:test');const assert=require('node:assert/strict');
require('reflect-metadata');
const {CommunicationService}=require('../dist/modules/communication/services/communication.service');
function setup(){
 const match={white:'white',black:'black',status:'active'},entries=[];
 const matches={get:async user=>{if(!['white','black'].includes(user))throw Error('Forbidden');return match;}};
 const dao={append:async entry=>{entries.push(entry);return entry;},list:async(id,kind,recipient)=>entries.filter(e=>e.kind===kind&&(!recipient||e.recipient===recipient))};
 return {match,entries,service:new CommunicationService(matches,dao,{get:()=>undefined})};
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

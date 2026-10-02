const {test}=require('node:test');
const assert=require('node:assert/strict');
require('reflect-metadata');
const {Chess}=require('chess.js');
const {MatchesService}=require('../dist/modules/matches/services/matches.service');
function setup() {
 const match={_id:'match',white:'white',black:'black',code:'ABC123',fen:new Chess().fen(),moves:[],status:'active'};
 const dao={finish:async(id,status,result,endReason)=>match.status===status?Object.assign(match,{status:status==='waiting'?'cancelled':'finished',result,endReason}):null,findById:async()=>match,findByCode:async()=>null,create:async input=>({...input,_id:'new'}),savePosition:async(id,fen,moves,status,result)=>Object.assign(match,{fen,moves,status,result})};
 return {service:new MatchesService(dao),match};
}
test('only the player whose turn it is can move',async()=>{
 const {service,match}=setup();
 await assert.rejects(service.move('black','match',{from:'e2',to:'e4'}));
 await assert.rejects(service.move('outsider','match',{from:'e2',to:'e4'}));
 const updated=await service.move('white','match',{from:'e2',to:'e4'});
 assert.deepEqual(updated.moves,['e4']);
 assert.equal(new Chess(match.fen).turn(),'b');
});
test('repetition survives persisted moves across requests',async()=>{
 const {service}=setup();let result;
 for(let round=0;round<2;round++) {
  for(const [user,from,to] of [['white','g1','f3'],['black','g8','f6'],['white','f3','g1'],['black','f6','g8']])result=await service.move(user,'match',{from,to});
 }
 assert.equal(result.status,'finished');assert.equal(result.result,'1/2-1/2');
});
test('generated codes are accepted by the join format',async()=>{
 const {service}=setup();
 for(let i=0;i<20;i++)assert.match((await service.create('white')).code,/^[A-Z0-9]{6}$/);
});
test('quitting awards the opponent a final win and blocks later moves',async()=>{
 for(const [player,result] of [['white','0-1'],['black','1-0']]){
  const {service,match}=setup();
  await assert.rejects(service.quit('outsider','match'));
  assert.equal(match.status,'active');
  const ended=await service.quit(player,'match');
  assert.equal(ended.status,'finished');assert.equal(ended.result,result);assert.equal(ended.endReason,'resignation');
  await assert.rejects(service.move('white','match',{from:'e2',to:'e4'}));
  const repeated=await service.quit(player==='white'?'black':'white','match');
  assert.equal(repeated.result,result);
 }
});
test('quitting a waiting room cancels without awarding a win',async()=>{
 const {service,match}=setup();match.status='waiting';match.black=null;
 const result=await service.quit('white','match');
 assert.equal(result.status,'cancelled');assert.equal(result.result,null);
});
test('a completed result is not overwritten by quitting',async()=>{
 const {service,match}=setup();match.status='finished';match.result='1/2-1/2';
 assert.equal((await service.quit('white','match')).result,'1/2-1/2');
});
test('a waiting-room join race is resolved as resignation after re-reading',async()=>{
 const match={_id:'match',white:'white',black:null,fen:new Chess().fen(),moves:[],status:'waiting'};
 let attempts=0;
 const dao={findById:async()=>match,finish:async(id,status,result,endReason)=>{
  if(attempts++===0){match.status='active';match.black='black';return null;}
  return Object.assign(match,{status:'finished',result,endReason});
 }};
 const service=new MatchesService(dao);
 assert.equal((await service.quit('white','match')).result,'0-1');
});

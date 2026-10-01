const {test}=require('node:test');
const assert=require('node:assert/strict');
require('reflect-metadata');
const {Chess}=require('chess.js');
const {MatchesService}=require('../dist/modules/matches/services/matches.service');
function setup() {
 const match={_id:'match',white:'white',black:'black',code:'ABC123',fen:new Chess().fen(),moves:[],status:'active'};
 const dao={findById:async()=>match,findByCode:async()=>null,create:async input=>({...input,_id:'new'}),savePosition:async(id,fen,moves,status,result)=>Object.assign(match,{fen,moves,status,result})};
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

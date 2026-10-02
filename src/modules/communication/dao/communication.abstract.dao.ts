export type Entry={id:string;sender:string;content:string;clientId:string;createdAt:string};
export type NewEntry={matchId:string;sender:string;recipient:string|null;kind:'message'|'signal';content:string;clientId:string;expiresAt:Date};
export abstract class CommunicationAbstractDao {
 abstract append(entry:NewEntry):Promise<Entry>;
 abstract list(matchId:string,kind:'message'|'signal',recipient?:string):Promise<Entry[]>;
}

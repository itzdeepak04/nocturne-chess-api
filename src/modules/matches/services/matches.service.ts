import { ForbiddenException, Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common'; import { Chess } from 'chess.js'; import { randomBytes } from 'crypto'; import { MESSAGE } from '../../../common/messages/messages.constant'; import { MatchesAbstractDao } from '../dao/matches.abstract.dao'; import { MakeMoveDto } from '../dto/match.dto'; import { MatchesAbstractService } from './matches.abstract.service';
@Injectable()
 export class MatchesService implements MatchesAbstractService {
     constructor(private readonly dao: MatchesAbstractDao)
      { }
       private view(match: any) {
         return { id: String(match._id), code: match.code, white: String(match.white), black: match.black ? String(match.black) : null, fen: match.fen, moves: match.moves, status: match.status, result: match.result, endReason: match.endReason }; } private allowed(match: any, userId: string) { return String(match.white) === userId || String(match.black) === userId;

          }
           async quit(userId: string, id: string) {
  // A player may join while a waiting room is being cancelled. Re-read on
  // conflict so that the resulting active match is awarded correctly.
  for (let attempt = 0; attempt < 2; attempt++) {
    const match = await this.dao.findById(id);
    if (!match) throw new NotFoundException(MESSAGE.MATCH.NOT_FOUND);
    if (!this.allowed(match, userId)) throw new ForbiddenException(MESSAGE.MATCH.NOT_PLAYER);
    if (match.status === 'finished' || match.status === 'cancelled') return this.view(match);
    const result = match.status === 'active' ? (String(match.white) === userId ? '0-1' : '1-0') : null;
    const updated = await this.dao.finish(id, match.status, result, match.status === 'active' ? 'resignation' : 'cancelled');
    if (updated) return this.view(updated);
  }
  throw new ConflictException(MESSAGE.MATCH.CLOSED);
 }
 async create(userId: string) {
             let code = '';
              do { code = randomBytes(3).toString('hex').toUpperCase();

               }
                while (await this.dao.findByCode(code));
                 return this.view(await this.dao.create({ code, white: userId, fen: new Chess().fen(), moves: [], status: 'waiting' }));
                 }
                  async join(userId: string, code: string) {
                     const found = await this.dao.findByCode(code);
                      if (!found)
                         throw new NotFoundException(MESSAGE.MATCH.NOT_FOUND); if (found.status === 'finished' || found.status === 'cancelled') throw new ConflictException(MESSAGE.MATCH.CLOSED); if (this.allowed(found, userId)) return this.view(found); if(found.status!=='waiting')throw new ConflictException(MESSAGE.MATCH.CLOSED); if (found.black) throw new ConflictException(MESSAGE.MATCH.FULL); const match = await this.dao.join(String(found._id), userId); if (!match) throw new ConflictException(MESSAGE.MATCH.FULL); return this.view(match); } async get(userId: string, id: string) { const match = await this.dao.findById(id); if (!match) throw new NotFoundException(MESSAGE.MATCH.NOT_FOUND); if (!this.allowed(match, userId)) throw new ForbiddenException(); return this.view(match); } async move(userId: string, id: string, dto: MakeMoveDto) { const match = await this.dao.findById(id); if (!match) throw new NotFoundException(MESSAGE.MATCH.NOT_FOUND); if (!this.allowed(match, userId) || match.status !== 'active') throw new ForbiddenException(); const game = new Chess(); match.moves.forEach(move => game.move(move)); const expected = game.turn() === 'w' ? String(match.white) : String(match.black); if (expected !== userId) throw new ForbiddenException(MESSAGE.MATCH.NOT_YOUR_TURN); let move; try { move = game.move({ from: dto.from, to: dto.to, promotion: dto.promotion ?? 'q' }); } catch { throw new BadRequestException(MESSAGE.MATCH.INVALID_MOVE); } const status = game.isGameOver() ? 'finished' : 'active'; const result = game.isCheckmate() ? (game.turn() === 'w' ? '0-1' : '1-0') : game.isDraw() ? '1/2-1/2' : null; const updated = await this.dao.savePosition(id, game.fen(), [...match.moves, move.san], status, result); if (!updated) throw new ConflictException(MESSAGE.MATCH.INVALID_MOVE); return this.view(updated); } }

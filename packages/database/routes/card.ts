import { Card } from '../schemas/card';
import { Card as CardType } from '../../../generated/typing';

import { TRoutesInput } from "../types/routes";

export const cardRoute = ({ app }: TRoutesInput) => {
  app.get('/api/card', async (req, res) => {
    console.log(`Looking for: ${req.query.name}`);
    const now = Date.now();
    const cards = await Card.find({ name: req.query.name });
    console.log(`Found: ${cards.length} in ${Date.now() - now}ms`);
    return res.send({ cards: cards.map((c: CardType) => ({
        name: c.name,
        set: c.set,
        lang: c.lang,
    })) });
  });
};

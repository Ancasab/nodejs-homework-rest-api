import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import User from './models/users.js';

dotenv.config();

const params = {
  secretOrKey: process.env.TOKEN_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new Strategy(params, async (payload, done) => {
    try {
      const user = await User.findOne({ email: payload.data.email });

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
      
    } catch (err) {
      return done(err, false);
    }
  })
);

export default passport;



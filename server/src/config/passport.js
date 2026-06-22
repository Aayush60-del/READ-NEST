const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

function maybeUseGoogleStrategy() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn(
      "[WARNING] Missing GOOGLE OAuth env vars. Google strategy disabled."
    );
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile?.emails?.[0]?.value;
          if (!email) {
            return done(new Error("Google profile missing email"));
          }

          let user = await User.findOne({ email });

          if (!user) {
            user = await User.create({
              name: profile.displayName,
              email,
              avatar: profile.photos?.[0]?.value,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

function maybeUseGitHubStrategy() {
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.warn(
      "[WARNING] Missing GitHub OAuth env vars. GitHub strategy disabled."
    );
    return;
  }

  passport.use(
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "/auth/github/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const githubId = profile?.id;
          if (!githubId) {
            return done(new Error("GitHub profile missing id"));
          }

          const email =
            profile?.emails?.find((item) => item.verified)?.value ||
            profile?.emails?.[0]?.value ||
            `github-${githubId}@users.noreply.github.com`;

          let user = await User.findOne({ githubId });

          if (!user && email) {
            user = await User.findOne({ email });
            if (user && !user.githubId) {
              user.githubId = githubId;
              await user.save();
            }
          }

          if (!user) {
            user = await User.create({
              githubId,
              email,
              name: profile.displayName || profile.username,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

maybeUseGoogleStrategy();
maybeUseGitHubStrategy();

module.exports = passport;


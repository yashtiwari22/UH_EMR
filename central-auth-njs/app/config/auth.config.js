module.exports = {
  access_secret: process.env.ACCESSTOKEN_SECRET,
  refresh_secret: process.env.REFRESHTOKEN_SECRET,
  // jwtExpiration: 3600,         // 1 hour
  // jwtRefreshExpiration: 86400, // 24 hours

  /* for test */
  jwtExpiration: process.env.JWTEXPIRATION, // 1 minute
  jwtRefreshExpiration: process.env.JWTREFRESHEXPIRATION, // 2 minutes
};

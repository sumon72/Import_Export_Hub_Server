const admin = require('firebase-admin');

let initialized = false;

function initFirebase(serviceAccountPath) {
  if (initialized) return;
  //const serviceAcc = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath)
  });
  initialized = true;
}

/**
 * Express middleware to verify Firebase ID token.
 * Expects header: Authorization: Bearer <ID_TOKEN>
 */
function firebaseAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.*)$/i);
  if (!match) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const idToken = match[1];

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      // decodedToken contains uid and claims
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        claims: decodedToken // includes custom claims if any
      };
      next();
    })
    .catch((err) => {
      console.error('Token verification error:', err);
      res.status(401).json({ error: 'Invalid or expired token' });
    });
}

module.exports = { initFirebase, firebaseAuthMiddleware };

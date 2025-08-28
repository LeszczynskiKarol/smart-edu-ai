// backend/src/middlewares/sessionValidation.js
const SESSION_MIN_DURATION = 2000; // 2 sekundy w milisekundach

const validateSessionDuration = (req, res, next) => {
  const { sessionData, eventType } = req.body;

  // Jeśli to pierwsza aktywność w sesji (np. session_start), przepuszczamy
  if (eventType === 'session_start') {
    return next();
  }

  // Sprawdzamy czy mamy dane sesji
  if (sessionData && sessionData.startTime) {
    const sessionStart = new Date(sessionData.startTime).getTime();
    const currentTime = Date.now();
    const duration = currentTime - sessionStart;

    // Jeśli sesja jest krótsza niż 2 sekundy, odrzucamy request
    if (duration < SESSION_MIN_DURATION) {
      return res.status(200).json({
        success: true,
        message: 'Session too short - activity ignored',
        filtered: true,
      });
    }
  }

  next();
};

module.exports = validateSessionDuration;

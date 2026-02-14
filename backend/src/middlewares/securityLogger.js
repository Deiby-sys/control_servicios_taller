// Seguridad para accesos sospechosos

// Logger para actividades sospechosas
export const logSecurityEvent = (req, eventType, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method,
    userId: req.user?._id?.toString() || 'anonymous',
    ...details
  };
  
  console.log(`[SECURITY] ${JSON.stringify(logEntry)}`);
};

// Middleware para registrar accesos no autorizados
export const securityLogger = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (res.statusCode === 401 || res.statusCode === 403) {
      logSecurityEvent(req, 'UNAUTHORIZED_ACCESS', {
        statusCode: res.statusCode,
        response: typeof data === 'string' ? data : JSON.stringify(data)
      });
    }
    return originalSend.call(this, data);
  };
  
  next();
};
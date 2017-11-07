const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  process.env.MONGODB_URI = 'mongodb://localhost:27018/Boodschapp';
  process.env.PORT = 3000;
} else if (env === 'test') {
  process.env.MONGODB_URI = 'mongodb://localhost:27018/BoodschappTest';
  process.env.PORT = 3000;
}

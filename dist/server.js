
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const redis = require('redis')
const session = require('express-session')
const short = require('short-uuid');
const path = require('path');
const config = require('./config');
const webpayPlusRouter = require("./routes/webpay_plus");
const bodyParser = require('body-parser');
const app = express();

let RedisStore = require('connect-redis')(session)

//Configure redis client
const redisClient = redis.createClient({
    port: 6379,
    legacyMode: true
})

redisClient.connect();

redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
});

redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully');
});

const sess = {
    name: 'pms-consulting',
    store: new RedisStore({ client: redisClient }),
    secret: config.COOKIE_SECRET,
    genid: req => {
        console.log('New session was created', short.generate());
        return short.generate();; // use UUIDs for session IDs
    },
    cookie: { maxAge: 60000, httpOnly: false, sameSite: 'strict' },
    resave: false,
    saveUninitialized: true
}

console.log(`WE ARE ON ${app.get('env')} MODE`)

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    //   sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess))
app.use(express.static(path.join(__dirname, "/assets")));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", true)
    res.header("Access-Control-Allow-Origin", config.FRONT_URL);
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Set-Cookie, Cookie, X-Forwarded-Proto");
    next();
});
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ extended: false }));


// routes
require('./controller/index.controller')(app);
app.use("/webpay_plus", webpayPlusRouter);

app.get("/", (req, res) => res.send("calling"));

app.listen(config.PORT, function () {
    console.log("App listening on http://" + config.HOST + ":" + config.PORT);
});

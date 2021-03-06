/**
 * Module dependencies.
 */
const express = require('express')
const compression = require('compression')
const session = require('express-session')
const bodyParser = require('body-parser')
const logger = require('morgan')
const lusca = require('lusca')
const path = require('path')
const tcpPortUsed = require('tcp-port-used')
const interfaces = require('os').networkInterfaces()
const flash = require('express-flash')
const open = require('open')

let addresses = []
for (var k in interfaces) {
	for (var k2 in interfaces[k]) {
		var address = interfaces[k][k2]
		if (address.family === 'IPv4' && !address.internal)
			addresses.push(address.address)
	}
}
url = addresses[0]
/**
 * Controllers (route handlers).
 */
const adminController = require('./controllers/admin')
const homeController = require('./controllers/home')
const userController = require('./controllers/user')

/**
 * Create Express server.
 */
const app = express()

/**
 * Express configuration.
 */
app.set('host', '0.0.0.0')
app.set('port', 3000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(compression())
app.use(logger('tiny'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: '123123123123',
	cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
}))
app.use(flash())
app.use((req, res, next) => {
	if (req.path === '/api/upload') {
		// Multer multipart/form-data handling needs to occur before the Lusca CSRF check.
		next()
	} else {
		lusca.csrf()(req, res, next)
	}
})
app.use(lusca.xframe('SAMEORIGIN'))
app.use(lusca.xssProtection(true))
app.disable('x-powered-by')
app.use((req, res, next) => {
	//res.locals.user = req.user
	res.locals.user = req.session.user
	next()
})
app.use((req, res, next) => {
	// After successful login, redirect back to the intended page
	if (!req.user
		&& req.path !== '/login'
		&& req.path !== '/signup'
		&& !req.path.match(/^\/auth/)
		&& !req.path.match(/\./)) {
		req.session.returnTo = req.originalUrl
	} else if (req.user
		&& (req.path === '/account' || req.path.match(/^\/api/))) {
		req.session.returnTo = req.originalUrl
	}
	next()
})
app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }))
app.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }))

/**
 * Primary app routes.
 */
app.get('/', homeController.index)
app.get('/start', homeController.startSurvey)
app.post('/survey/submit', homeController.postSubmit)

/**
 * Navigation
 */
app.get('/overview', adminController.index)
app.get('/sessions', adminController.sessions)
app.get('/teachers', adminController.teachers)
app.get('/subjects', adminController.subjects)
app.get('/questionnaires', adminController.questionnaires)

/**
 * Sessions
 */
app.post('/session/start', adminController.startSession)
app.get('/session/end', adminController.endSession)
app.get('/session/continue', adminController.continueSession)
app.get('/session/results', adminController.displayResults)
app.get('/session/download', adminController.downloadResults)
app.get('/session/results/remove', adminController.removeResult)
app.get('/session/delete', adminController.deleteSession)
app.post('/session/merge', adminController.mergeSessions)

/**
 * Teachers
 */
app.post('/teachers/add', adminController.addTeacher)
app.get('/teachers/remove', adminController.removeTeacher)
app.get('/teachers/removeSubject', adminController.removeTeacherSubject)

/**
 * Subjects
 */
app.post('/subject/add', adminController.addSubject)
app.get('/subject/remove', adminController.removeSubject)
app.post('/section/add', adminController.addSection)
app.get('/section/remove', adminController.removeSection)

/**
 * Questionnaire
 */
app.post('/questionnaire/update', adminController.updateQuestionnaire)
app.post('/questionnaire/addRaw', adminController.createRawQuestionnaire)
app.post('/questionnaire/add', adminController.createQuestionnaire)
app.get('/questionnaire/delete', adminController.deleteQuestionnaire)
app.get('/questionnaire/add/evaluator', adminController.questionnaireAddEvaluator)
app.get('/questionnaire/remove/evaluator', adminController.questionnaireRemoveEvaluator)
app.get('/questionnaire/add/question', adminController.questionnaireAddQuestion)
app.get('/questionnaire/remove/question', adminController.questionnaireRemoveQuestion)
app.get('/questionnaire/add/category', adminController.questionnaireAddCategory)
app.get('/questionnaire/remove/category', adminController.questionnaireRemoveCategory)
app.get('/questionnaire/view', adminController.displayQuestionnaire)


/**
 * Users
 */
app.get('/login', userController.getLogin)
app.post('/login', userController.postLogin)
app.get('/logout', userController.logout)
app.get('/signup', userController.getSignup)
app.post('/signup', userController.postSignup)
app.get('/account', userController.getAccount)
app.post('/account/password', userController.postUpdatePassword)
app.post('/account/profile', userController.postUpdateProfile)

/**
 * Error Handler.
 */
app.use((err, req, res, next) => {
	console.error(err)
	res.status(500).send('Server Error')
})

/**
 * Start Express server.
 */



//let listener = app.listen(0, url, () => {
portNumber = 8000
tcpPortUsed.check(3000, 'localhost').then(function (inUse) {
	if (inUse)
		portNumber = 0

	let listener = app.listen(portNumber, url, () => {
		// if (!inUse)
		// 	console.log('App is running at http://' + url + ' in %s mode', app.get('env'))
		// else
		console.log('App is running at http://' + url + ':%d in %s mode', listener.address().port, app.get('env'))
		console.log('Press CTRL-C to stop\n')
		//open('http://'+url+':'+listener.address().port+'/admin')
	})
}, function (err) {
	console.error('Error on check:', err.message)
})

module.exports = app
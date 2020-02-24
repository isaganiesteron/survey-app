const locallydb = require('locallydb')
let db = new locallydb('././db')

/*
tempsubjectsDb.find({}, function(err,items){
  arrInsert = []
  items.forEach((q,qInd) => {
    itemInsert = q
    delete itemInsert._id
    //itemInsert.cid = qInd
    arrInsert.push(itemInsert)
  })
  console.log(arrInsert)
  //console.log(subjectsDb.insert(arrInsert)) //this displays all the cid created
})
*/

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  let sessionsDb = db.collection('sessions')
  let questionsDb = db.collection('questions')

  let activeSession = sessionsDb.where({active: true}).items
  if(activeSession.length > 0){
    let existingQuestions = questionsDb.get(parseInt(activeSession[0].questionnaire))
    if(existingQuestions){
      res.render('home', {
        title: 'Home',
        start: false,
        session: activeSession[0],
        survey: existingQuestions,
        lists: null
      });
    }
  } else {
    res.render('home', {
      title: 'Home',
      start: false,
      session: null,
      survey: null,
      lists: null
    });
  }
}

exports.startSurvey = (req, res) => {
  let sessionsDb = db.collection('sessions')
  let questionsDb = db.collection('questions')
  let teachersDb = db.collection('teachers')
  let subjectsDb = db.collection('subjects')

  let sectionsList = []

  let existingSession = sessionsDb.where({active: true}).items
  if(existingSession.length < 1){
    res.render('home', {
      title: 'Home',
      session: null,
      survey: null,
      lists: null
    });
    return
  }  
  let currentQuestions = questionsDb.get(parseInt(existingSession[0].questionnaire))
  let currentTeachers = teachersDb.items
  let currentSubjects = subjectsDb.items
  
  currentTeachers.sort((a,b) => {
    if(a.name < b.name) { return -1 }
    if(a.name > b.name) { return 1 }
    return 0
  })
  currentSubjects.sort((a,b) => {
    if(a.name < b.name) { return -1 }
    if(a.name > b.name) { return 1 }
    return 0
  })
  currentSubjects.forEach((sub) => {
    sub.sections.forEach(section => {
      if(sectionsList.indexOf(section) < 0)
        sectionsList.push(section)
    })
  })
  res.render('home', {
    title: 'Home',
    session: existingSession[0],
    survey: currentQuestions,
    start: true,
    lists: [
      {name:"teachers",data:currentTeachers},
      {name:"subjects",data:currentSubjects},
      {name:"sections",data:sectionsList}
    ]
  });
}

/**
 * Submit survey
 */

exports.postSubmit = (req, res) => {
  let sessionsDb = db.collection('sessions')

  let closingMessage = req.body.closing_message
  delete req.body._csrf
  delete req.body.closing_message

  let existingSession = sessionsDb.get(parseInt(req.body.session_id))
  if(!existingSession){
    req.flash('errors', { msg: 'Session not found. Please contact your administrator.' })
    return res.redirect('/');
  } else {
    let tempAnswers = existingSession.answers
    req.body._id = tempAnswers.length
    tempAnswers.push(req.body)
    
    if(sessionsDb.update(existingSession.cid,{answers: tempAnswers})){  //return true if succesfully inserted
      req.flash('success', { msg: closingMessage })
      res.redirect('/')
    }
  }
}
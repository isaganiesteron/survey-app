const locallydb = require('locallydb')
const xl = require('excel4node');
let db = new locallydb('././db')
const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ', 'BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BK', 'BL', 'BM', 'BN', 'BO', 'BP', 'BQ', 'BR', 'BS', 'BT', 'BU', 'BV', 'BW', 'BX', 'BY', 'BZ']

function authentication(req) {
	if (req.session.user && req.session.admin)
		return true
	else
		return false
}

function removeDups(names) {
	let unique = {};
	names.forEach(function (i) {
		if (!unique[i]) {
			unique[i] = true;
		}
	});
	return Object.keys(unique);
}

function writeSpreadsheet(data, cb) {
	let wb = new xl.Workbook()
	let style1 = wb.createStyle({
		font: {
			bold: true,
			size: 20,
		},
		alignment: {
			horizontal: 'center'
		}
	})

	let style2 = wb.createStyle({
		font: {
			bold: true
		},
		alignment: {
			horizontal: 'right'
		}
	})

	let style3 = wb.createStyle({
		font: {
			bold: true,
			size: 14,
		},
		alignment: {
			horizontal: 'center'
		},
		numberFormat: '0.00',
	})

	let style4 = wb.createStyle({
		font: {
			bold: true,
			size: 16,
			color: 'green'
		},
		alignment: {
			horizontal: 'center'
		},
		numberFormat: '0.00',
	})

	let style5 = wb.createStyle({
		font: {
			bold: false,
			size: 12,
			color: '#696969'
		},
		alignment: {
			horizontal: 'left'
		}
	})

	let style6 = wb.createStyle({
		alignment: {
			horizontal: 'center'
		},
		numberFormat: '0.00',
	})

	let style7 = wb.createStyle({
		font: {
			bold: true,
			size: 16,
			color: '#696969'
		},
		alignment: {
			horizontal: 'center'
		},
		numberFormat: '0.00',
	})

	let style8 = wb.createStyle({
		font: {
			bold: true,
			size: 14,
			color: '#696969'
		},
		alignment: {
			horizontal: 'center'
		},
		numberFormat: '0.00',
	})

	if (data[0].structured == 'false') {
		/**
		 *  Preschool Parents Evaluation Form (not structured)
		 */

		let allanswers = wb.addWorksheet(data[2])
		let question_row = 8
		let responder_column = 3
		let counter = 0
		let cat_label = ['A', 'B', 'C', 'D', 'E', 'F']
		let overal_average = 0
		allanswers.column(1).setWidth(8)
		allanswers.column(2).setWidth(100)
		allanswers.cell(1, 2).string("Session Name: " + data[2]).style(style1)
		allanswers.cell(2, 2).string("Questionnaire: " + data[0].name)
		allanswers.cell(3, 2).string("Responses: " + data[1].length)
		allanswers.cell(4, 2).string("Questions").style({ alignment: { horizontal: 'center' } })
		allanswers.cell(5, 2).string("Responder")
		allanswers.cell(6, 2).string("Number of Years with HOPE")
		allanswers.cell(7, 2).string("Childrens level")

		data[0].questions.forEach((cat, catInd) => {
			cat.questions.forEach((quest, questInd) => {
				allanswers.cell((counter + question_row), 1).string(cat_label[catInd] + ". " + (questInd + 1))
				allanswers.cell((counter + question_row), 2).string(quest.question)
				counter++
				if (catInd == (data[0].questions.length - 1) && questInd == (cat.questions.length - 1)) {
					allanswers.cell(((counter + question_row) + 1), 2).string("Average").style(style2)
				}
			})
		})

		data[1].forEach((answer, answerInd) => {
			let counter2 = 0
			let curr_total = 0
			let curr_count = 0
			let choices = []
			if (answer.evaluator_0 == '')
				allanswers.cell(5, (answerInd + responder_column)).string('Anonymous').style(style7)
			else
				allanswers.cell(5, (answerInd + responder_column)).string(answer.evaluator_0).style(style7)
			allanswers.cell(6, (answerInd + responder_column)).string(answer.evaluator_1 + " years").style({ alignment: { horizontal: 'center' } })
			allanswers.cell(7, (answerInd + responder_column)).string(answer.evaluator_2).style({ alignment: { horizontal: 'center' } })
			data[0].questions.forEach((cat, catInd) => {
				cat.questions.forEach((quest, questInd) => {
					current_answer = ""
					if (answer["q_" + catInd + "_" + questInd]) {
						allanswers.column((answerInd + responder_column)).setWidth(30)
						if (quest.type == 'choice') {
							current_answer = answer['q_' + catInd + '_' + questInd] + ": " + quest.choices.find(({ value }) => value === answer['q_' + catInd + '_' + questInd]).text
							allanswers.cell((counter2 + question_row), (answerInd + responder_column)).string(current_answer).style({ alignment: { horizontal: 'center' } })
							choices = quest.choices
						} else {
							current_answer = (answer["q_" + catInd + "_" + questInd]).toString()
							allanswers.cell((counter2 + question_row), (answerInd + responder_column)).string(current_answer).style({ alignment: { horizontal: 'center' }, font: { italics: true } })
						}
					}
					if (!isNaN(parseInt(answer["q_" + catInd + "_" + questInd]))) {
						curr_total += parseInt(answer["q_" + catInd + "_" + questInd])
						curr_count++
					}
					counter2++
					if (catInd == (data[0].questions.length - 1) && questInd == (cat.questions.length - 1)) {
						allanswers.cell(((counter2 + question_row) + 1), (answerInd + responder_column)).string(Math.round(curr_total / curr_count) + ": " + choices.find(({ value }) => value === (Math.round(curr_total / curr_count)).toString()).text).style(style3)
						overal_average += (curr_total / curr_count)
					}
				})
			})
			if (answerInd == (data[1].length - 1)) {
				allanswers.cell(48, 2).string("Overall Average").style(style2)
				allanswers.cell(48, 3).string(Math.round(overal_average / data[1].length) + ": " + choices.find(({ value }) => value === (Math.round(overal_average / data[1].length)).toString()).text).style(style4)
			}
		})
		wb.write('output/' + data[2] + '.xlsx', function (err, stats) {
			if (err) {
				cb(false)
			} else {
				cb(true)
			}
		})
	} else {
		/**
		 *  Students Evaluation Form For Teachers
		 */
		if (data[3].mode == "print") {

			var options = {
				/*printOptions: {
					centerHorizontal: true,
					centerVertical: true,
					printGridLines: false,
					printHeading: false
				},*/
				pageSetup: {
					orientation: 'landscape'
				},
				margins: {
					left: parseFloat(data[3].left),
					right: parseFloat(data[3].right),
					top: parseFloat(data[3].top),
					bottom: parseFloat(data[3].bottom)
				}
			}
			data[1].forEach(teacher => {
				let curTeacher = wb.addWorksheet(teacher.name, options)
				curTeacher.cell(1, 2).string(teacher.name).style(style1).style({ font: { size: 10 } })
				curTeacher.cell(24, 1).string("Section Average").style({ font: { size: 9 }, alignment: { horizontal: "left" } })
				curTeacher.cell(26, 1).string("Subject Average").style({ font: { size: 9 }, alignment: { horizontal: "left" } })
				curTeacher.cell(27, 1).string("Total Average").style({ font: { size: 9 }, alignment: { horizontal: "left" } })
				getAverageScore(data[0], teacher.answers, score => {
					curTeacher.cell(27, 4).string("Based on " + score.count + " responses").style(style5).style({ font: { size: 9 } })
					curTeacher.cell(27, 2).string((score.total / score.count).toFixed(2)).style(style4).style({ font: { size: 9 } })	//dont average this
				})
				curTeacher.cell(28, 2).string("Questions").style({ alignment: { horizontal: 'center' } })
				for (a = 2;a < 30;a++) {
					curTeacher.row(a).setHeight(12)
				}
				let counter = 0
				let question_row = 29
				data[0].questions.forEach((cat, catInd) => {
					cat.questions.forEach((quest, questInd) => {
						if (quest.type == 'choice') {
							curTeacher.cell((counter + 4), 1).number((questInd + 1)).style({ font: { size: 9 } })
							curTeacher.cell((counter + question_row), 1).number((questInd + 1)).style({ font: { size: 8 } })
							curTeacher.cell((counter + question_row), 2).string(quest.question).style({ font: { size: 8 } })
							curTeacher.row((counter + question_row)).setHeight(10)
							counter++
						}
					})
				})

				columnCount = 0
				columnIncrement = 2
				remarks = []
				remarkCounter = 0
				teacher.subjects.forEach(sub => {

					curTeacher.cell(2, (columnCount + 2), 2, ((columnCount + 1) + sub.sections.length), true).string(sub.name).style(style7).style({ font: { size: 9 } })	//subject name
					subColStart = columnCount
					subColEnd = 0
					sub.sections.forEach(sec => {
						curTeacher.cell(3, (columnCount + 2)).string(sec.name).style({ alignment: { horizontal: 'center' } }).style(style7).style({ font: { size: 9 } })	//section name
						curTeacher.column((columnCount + 2)).setWidth(10)
						questionsTotal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
						sec.answers.forEach(secAnswers => {
							for (i = 0;i < 20;i++) {
								questionsTotal[i] += secAnswers['q_0_' + i] * 1
							}
							if (secAnswers['q_0_20'] != '') {
								remarks.push(secAnswers['q_0_20'])
							}
						})
						curSecTotal = 0
						for (i = 0;i < 20;i++) {
							curSecTotal += questionsTotal[i] * 1
							curAve = questionsTotal[i] / sec.answers.length
							curTeacher.cell((4 + i), (columnCount + columnIncrement)).number(parseFloat(curAve.toFixed(2))).style({ font: { size: 9 }, alignment: { horizontal: 'center' } })
							if (i == 19) {
								curTeacher.column(((columnCount + columnIncrement) + 1)).setWidth(1)

								getAverageScore(data[0], sec.answers, secScore => {
									curTeacher.cell(24, (subColStart + 2), 24, ((subColStart + 2) + sub.sections.length - 1), true).number(parseFloat((secScore.total / secScore.count).toFixed(2))).style(style3).style({ font: { size: 9 } }) //current 
								})
								curTeacher.cell(((5 + i) + 1), (columnCount + columnIncrement)).string("Responses: " + sec.answers.length).style(style5).style({ font: { size: 9 } }) //number of responders in this section
								subColEnd = columnCount + 1
							}
						}
						columnCount++
					})

					getAverageScore(data[0], sub.answers, subScore => {
						curTeacher.cell(26, (subColStart + 2), 26, ((subColStart + 2) + sub.sections.length - 1), true).number(parseFloat((subScore.total / subScore.count).toFixed(2))).style(style3).style({ font: { size: 9 } }) //current 
					})
					columnCount++
				})
				curTeacher.cell(1, 1, 1, (columnCount + 1), true).string(teacher.name).style(style1)

				if (remarks.length > 0) {
					curTeacher.cell(49, 1).string("Remarks").style(style2).style({ font: { size: 9 } }).style({ font: { size: 9 }, alignment: { horizontal: "left" } })
					remarks.forEach((rem, remInd) => {
						curTeacher.cell((50 + remInd), 1, (50 + remInd), 12, true).string("'" + rem + "'").style({ alignment: { wrapText: true, vertical: 'center' }, font: { size: 8 } })
						curTeacher.row(50 + remInd).setHeight(22)
					})
				}
			})
			temp_file_name = 'output/' + data[2] + '.xlsx'
			wb.write(temp_file_name, function (err, stats) {
				if (err) {
					cb(false)
				} else {
					cb(temp_file_name)
				}
			})
		} else {
			data[1].forEach(teacher => {
				let emailWB = new xl.Workbook()
				let emailScores = emailWB.addWorksheet("Scores")
				let emailRemarks = emailWB.addWorksheet("Remarks")
				emailScores.column(2).setWidth(105)

				emailScores.cell(1, 1).string(teacher.name).style(style1)
				emailScores.cell(3, 2).string("Questions").style({ alignment: { horizontal: 'center' } })
				emailScores.cell(24, 2).string("Section Average").style(style2)
				emailScores.cell(26, 2).string("Subject Average").style(style2)
				emailScores.cell(28, 2).string("Total Average").style(style2)
				getAverageScore(data[0], teacher.answers, score => {
					emailScores.cell(28, 5).string("Based on " + score.count + " responses").style(style5)
					emailScores.cell(28, 3).string((score.total / score.count).toFixed(2)).style(style4)	//dont average this
				})

				data[0].questions.forEach(cat => {
					cat.questions.forEach((quest, questInd) => {
						if (quest.type == 'choice') {
							emailScores.cell(((questInd + 1) + 3), 1).number((questInd + 1))
							emailScores.cell(((questInd + 1) + 3), 2).string(quest.question)
						}
					})
				})

				columnCount = 0
				columnIncrement = 3
				remarks = []
				teacher.subjects.forEach(sub => {
					emailScores.cell(2, (columnCount + 3), 2, ((columnCount + 2) + sub.sections.length), true).string(sub.name).style(style7)	//subject name
					subColStart = columnCount
					subColEnd = 0
					sub.sections.forEach(sec => {
						emailScores.cell(3, (columnCount + 3)).string(sec.name).style({ alignment: { horizontal: 'center' } }).style(style8)	//section name
						emailScores.column((columnCount + 3)).setWidth(13)
						questionsTotal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
						sec.answers.forEach(secAnswers => {
							for (i = 0;i < 20;i++) {
								questionsTotal[i] += secAnswers['q_0_' + i] * 1
							}
							if (secAnswers['q_0_20'] != '') {
								remarks.push(secAnswers['q_0_20'])
							}
						})
						curSecTotal = 0
						for (i = 0;i < 20;i++) {
							curSecTotal += questionsTotal[i] * 1
							curAve = questionsTotal[i] / sec.answers.length
							emailScores.cell((4 + i), (columnCount + columnIncrement)).number(curAve).style(style6)
							if (i == 19) {
								emailScores.column(((columnCount + columnIncrement) + 1)).setWidth(2)
								emailScores.cell((5 + i), (columnCount + columnIncrement)).formula('=AVERAGE(' + cols[columnCount + 2] + '4:' + cols[columnCount + 2] + '23)').style(style3) //current section average
								emailScores.cell(((5 + i) + 1), (columnCount + columnIncrement)).string("Responses: " + sec.answers.length).style(style5) //number of responders in this section
								subColEnd = columnCount + 1
							}
						}
						columnCount++
					})

					emailScores.cell(26, (subColStart + 3), 26, ((subColStart + 3) + sub.sections.length - 1), true).formula('=AVERAGE(' + cols[(columnCount + 1)] + '24:' + cols[subColEnd] + '24)').style(style3) //current section average

					columnCount++
				})
				emailScores.cell(1, 1, 1, (columnCount + 1), true).string(teacher.name).style(style1)

				emailRemarks.cell(31, 2).string("Remarks").style({ alignment: { horizontal: 'center' } })
				remarks.forEach((rem, remInd) => {
					emailRemarks.cell((remInd), 2).string("'" + rem + "'").style({ font: { italics: true } })
				})
				temp_file_name = 'output/' + teacher.name + '_' + data[2] + '.xlsx'
				emailWB.write(temp_file_name, function (err, stats) {
					if (err) {
						cb(false)
					} else {
						cb(temp_file_name)
					}
				})
			})
		}
	}
}
//loadSpreadsheet(1)
function loadSpreadsheet(id) {
	let sessionsDb = db.collection('sessions')
	let session = sessionsDb.get(parseInt(id))
	///session/download?id=1&mode=print&remarks=true&top=0.2&bottom=0.2&right=0.2&left=0.2
	options = {
		id: id.toString(),
		mode: "email",
		create: true,
		top: "0",
		bottom: "0",
		right: "0",
		left: "0",
	}
	prepareSession(session.cid, options, result => {
		if (result)
			console.log(session.name + ' downloaded.')
		else
			console.log('!*!*!*!*!*!*! ' + session.name + ' not downloaded..')
	})
}

function prepareSession(id, options, cb) {
	let questionsDb = db.collection('questions')
	let sessionsDb = db.collection('sessions')

	let existingSession = sessionsDb.get(parseInt(id))
	let ansList = existingSession.answers
	let questions = questionsDb.get(parseInt(existingSession.questionnaire))
	overallAnsList = []
	teachList = []
	subjectList = []
	sectionList = []

	if (existingSession) {
		if (existingSession.questionnaire == 0) {
			ansList.forEach((ans) => {
				if (teachList.indexOf(ans.evaluator_0) < 0)
					teachList.push(ans.evaluator_0)
				if (subjectList.indexOf(ans.evaluator_1) < 0)
					subjectList.push(ans.evaluator_1)
				if (sectionList.indexOf(ans.evaluator_2) < 0)
					sectionList.push(ans.evaluator_2)

				teachList.sort()
				subjectList.sort()
				sectionList.sort()
			})
			//get all subject names for each teacher
			teachList.forEach(teach => {
				teacherAnswers = []
				teacherSubjectList = []

				ansList.forEach(ans => {
					if (ans.evaluator_0 == teach) {
						teacherAnswers.push(ans)
						if (teacherSubjectList.map(function (e) { return e.name; }).indexOf(ans.evaluator_1) < 0)
							teacherSubjectList.push({ name: ans.evaluator_1, answers: [], sections: [] })

					}
				})
				overallAnsList.push({ name: teach, answers: teacherAnswers, subjects: teacherSubjectList })
			})
			//get all subjects answers and sections names for each teacher
			overallAnsList.forEach(teach => {
				teach.subjects.forEach(sub => {
					ansList.forEach(ans => {
						if (ans.evaluator_0 == teach.name && ans.evaluator_1 == sub.name) {
							sub.answers.push(ans)
							if (sub.sections.map(function (e) { return e.name; }).indexOf(ans.evaluator_2) < 0)
								sub.sections.push({ name: ans.evaluator_2, answers: [] })
						}
					})
				})
			})
			//get all sections answers for each subject for each teacher
			overallAnsList.forEach(teach => {
				teach.subjects.forEach(sub => {
					sub.sections.forEach(section => {
						ansList.forEach(ans => {
							if (ans.evaluator_0 == teach.name && ans.evaluator_1 == sub.name && ans.evaluator_2 == section.name)
								section.answers.push(ans)
						})
					})
				})
			})
		}
		if (options.create) {
			delete options.create
			delete options.id
			if (existingSession.questionnaire == 0) {
				writeSpreadsheet([questions, overallAnsList, existingSession.name, options], (writeRes) => {
					if (cb)
						cb(writeRes)
				})
			} else {
				writeSpreadsheet([questions, ansList, existingSession.name, options], (writeRes) => {
					if (cb)
						cb(writeRes)
				})
			}

		} else {
			if (cb)
				cb({
					questions: questions,
					session: existingSession,
					answer_list: ansList,
					organized_list: overallAnsList
				})
		}
	} else {
		if (cb)
			cb(false)
	}
}

function getAverageScore(questionSet, answerList, next) {
	//use questions set to determine what to average

	answer_averages = {}
	questionPointers = []
	questionSet.questions.forEach((cat, catInd) => {
		curPointer = "q_" + catInd
		cat.questions.forEach((ques, questInd) => {
			if ('choices' in ques) {
				if (ques.choices.length > 0) {
					questionPointers.push(curPointer + '_' + questInd)
					answer_averages[curPointer + '_' + questInd] = 0
				}
			}
		})
	})

	ansTotal = 0
	ansCount = 0
	answerList.forEach((ans, ansInd) => {
		curAnsTotal = 0
		curAnsCount = 0
		questionPointers.forEach((items) => {
			curAnsTotal += (ans[items] * 1)
			answer_averages[items] += (ans[items] * 1)
			curAnsCount++
		})

		ansTotal += (curAnsTotal / curAnsCount)
		ansCount++
	})
	next({
		each: answer_averages,
		total: ansTotal,
		count: ansCount
	})
}

exports.index = (req, res) => {
	if (authentication(req)) {
		let sessionsDb = db.collection('sessions')
		let questionsDb = db.collection('questions')
		let teachersDb = db.collection('teachers')
		let subjectsDb = db.collection('subjects')

		let allSessions = sessionsDb.items
		let allTeachers = teachersDb.items
		let allSubjects = subjectsDb.items
		let allQuestions = questionsDb.items

		let activeSession = "No active session"
		allSessions.sort(function (a, b) { return (b.createdTS * 1) - (a.createdTS * 1) })

		allSessions.forEach(sess => {
			if (sess.active)
				activeSession = sess.name
		})
		res.render('overview', {
			title: 'overview',
			active: activeSession,
			sessions: allSessions.length,
			teachers: allTeachers.length,
			subjects: allSubjects.length,
			questionnaires: allQuestions.length
		});
	} else {
		res.redirect('/login');
	}
};

exports.sessions = (req, res) => {
	if (authentication(req)) {
		let questionsDb = db.collection('questions')
		let sessionsDb = db.collection('sessions')

		let allSessions = sessionsDb.items
		let allQuestions = questionsDb.items

		allSessions.sort(function (a, b) { return (b.createdTS * 1) - (a.createdTS * 1) })

		res.render('sessions', {
			title: 'sessions',
			sessions: allSessions,
			surveys: allQuestions
		});
	} else {
		res.redirect('/login');
	}
};
exports.teachers = (req, res) => {
	if (authentication(req)) {
		let teachersDb = db.collection('teachers')
		let subjectsDb = db.collection('subjects')
		let allTeachers = teachersDb.items
		let allSubjects = subjectsDb.items
		allTeachers.sort((a, b) => {
			if (a.name < b.name) { return -1 }
			if (a.name > b.name) { return 1 }
			return 0
		})
		allSubjects.sort((a, b) => {
			if (a.name < b.name) { return -1 }
			if (a.name > b.name) { return 1 }
			return 0
		})
		res.render('teachers', {
			title: 'teachers',
			teachers: allTeachers,
			subjects: allSubjects
		});
	}
}

exports.subjects = (req, res) => {
	if (authentication(req)) {
		let teachersDb = db.collection('teachers')
		let subjectsDb = db.collection('subjects')
		let allTeachers = teachersDb.items
		let allSubjects = subjectsDb.items
		allTeachers.sort((a, b) => {
			if (a.name < b.name) { return -1 }
			if (a.name > b.name) { return 1 }
			return 0
		})
		allSubjects.sort((a, b) => {
			if (a.name < b.name) { return -1 }
			if (a.name > b.name) { return 1 }
			return 0
		})
		res.render('subjects', {
			title: 'subjects',
			teachers: allTeachers,
			subjects: allSubjects
		});
	}
}

exports.questionnaires = (req, res) => {
	if (authentication(req)) {
		let questionsDb = db.collection('questions')
		let allQuestions = questionsDb.items
		let single = false
		if (req.query.id)
			single = allQuestions.find(({ cid }) => cid === parseInt(req.query.id))

		res.render('questionnaire', {
			title: 'questionnaires',
			questions: allQuestions,
			single: single
		})

	}
}

exports.updateQuestionnaire = (req, res) => {
	if (authentication(req)) {
		let questionsDb = db.collection('questions')
		let allQuestions = questionsDb.items
		let questionnaireId = parseInt(req.body.questionnaireId)
		let existingQuestion = allQuestions.find(({ cid }) => cid === questionnaireId)

		let evaluatorList = []
		let questionsList = []

		for (let [key, value] of Object.entries(req.body)) {
			console.log(`${key}: ${value}`);
			if (key.split("_")[0] == 'evaluator')
				evaluatorList.push(value)
			else if (key.split("_")[0] == 'question')
				questionsList.push(value)
		}

		questionCount = 0

		existingQuestion.name = req.body.name
		existingQuestion.instructions = req.body.instructions
		existingQuestion.opening = req.body.opening
		existingQuestion.closing = req.body.closing

		existingQuestion.evaluator.forEach((curr, currInd) => {
			curr.question = evaluatorList[currInd]
		})

		existingQuestion.questions.forEach(category => {
			category.questions.forEach(question => {
				question.question = questionsList[questionCount]
				questionCount++
			})
		})

		if (existingQuestion) {
			if (questionsDb.update(questionnaireId, existingQuestion)) {
				req.flash('success', { msg: 'Questionnaire updated.' })
				res.render('questionnaire', {
					title: 'questionnaires',
					questions: allQuestions,
					single: existingQuestion
				})
			} else {
				req.flash('errors', { msg: 'Questionnaire not updated.' })
				res.render('questionnaire', {
					title: 'questionnaires',
					questions: allQuestions,
					single: single
				})

			}
		} else {
			req.flash('errors', { msg: 'Questionnaire not found.' })
			res.render('questionnaire', {
				title: 'questionnaires',
				questions: allQuestions,
				single: single
			})
		}

	}
}

/**
 * Sessions
 */
exports.startSession = (req, res) => {
	if (authentication(req)) {
		let sessionsDb = db.collection('sessions')

		let newSession = {
			active: true,
			name: req.body.session_name,
			questionnaire: req.body.questionnaire,
			createdTS: new Date().getTime(),
			createdAt: new Date().toUTCString(),
			answers: []
		}

		let existingSessions = sessionsDb.where({ active: true }).items
		if (existingSessions < 1) {
			if (sessionsDb.insert(newSession)) {
				req.flash('success', { msg: 'Session ' + newSession.name + ' is now active.' });
				res.redirect('/sessions');
			} else {
				req.flash('errors', { msg: 'Something went wrong. Please try again.' });
				res.redirect('/sessions');
			}

		} else {
			req.flash('errors', { msg: 'A session is currently active. End the current session before starting a new one.' });
			res.redirect('/sessions');
		}

	} else {
		res.redirect('/')
	}
}

exports.endSession = (req, res) => {
	if (authentication(req)) {
		let sessionsDb = db.collection('sessions')
		if (sessionsDb.update(parseInt(req.query.id), { active: false })) {
			req.flash('success', { msg: 'Session is now inactive.' });
			res.redirect('/sessions');
		} else {
			req.flash('errors', { msg: 'Something went wrong. Please try again.' });
			res.redirect('/sessions');
		}
	} else {
		res.redirect('/');
	}
}

exports.continueSession = (req, res) => {
	if (authentication(req)) {
		let sessionsDb = db.collection('sessions')

		let existingSession = sessionsDb.where({ active: true }).items
		if (existingSession.length > 0) {
			req.flash('errors', { msg: 'A session is currently active. End the current session before starting a new one.' });
			res.redirect('/sessions');
		} else {
			if (sessionsDb.update(parseInt(req.query.id), { active: true })) {
				req.flash('success', { msg: 'Session is now active.' });
				return res.redirect('/sessions');
			} else {
				req.flash('errors', { msg: 'Something went wrong. Please try again.' });
				res.redirect('/sessions');
			}
		}
	} else {
		res.redirect('/');
	}
}

exports.displayResults = (req, res) => {
	if (authentication(req)) {
		single = req.query.single || false //for single responder view
		teacher = req.query.teacher || false //for view based on teacher
		subject = req.query.subject || false //for view based on subject
		section = req.query.section || false //for view based on subject
		result = []

		prepareSession(parseInt(req.query.id), { create: false }, (session) => {
			if (session) {
				if (single) {
					find = parseInt(single)
					if (isNaN(find))
						find = single

					single = session.answer_list.find(({ _id }) => _id === find)
				}
				if (session.questions.structured) {
					session.organized_list.forEach(teacher => {
						getAverageScore(session.questions, teacher.answers, (data) => {
							teacher_data = {
								name: teacher.name,
								answers: teacher.answers,
								score: data,
								subjects: []
							}
							teacher.subjects.forEach(subjects => {
								getAverageScore(session.questions, subjects.answers, (subjectData) => {
									temp_subjects = {
										name: subjects.name,
										answers: subjects.answers,
										score: subjectData,
										sections: []
									}
									subjects.sections.forEach(section => {
										getAverageScore(session.questions, section.answers, (sectionData) => {
											temp_sections = {
												name: section.name,
												answers: section.answers,
												score: sectionData
											}
											temp_subjects.sections.push(temp_sections)
										})
									})
									teacher_data.subjects.push(temp_subjects)
								})
							})
							result.push(teacher_data)
						})
					})
				}
				res.render('results', {
					title: "Results - " + req.query.id,
					questions: session.questions,
					session: session.session,
					summary: result,
					filter: { single: single, teacher: teacher, subject: subject, section: section }
				});
			}
		})
	} else {
		res.redirect('/');
	}
}


exports.downloadResults = (req, res) => {
	if (authentication(req)) {
		req.query.create = true
		if (req.query.id == 'all') {
			let sessionsDb = db.collection('sessions')
			let allSessions = sessionsDb.items
			resString = ""
			allSessions.forEach(session => {
				prepareSession(session.cid, req.query, false)
			})
			req.flash('success', { msg: 'All session files reloaded.' })
			res.redirect('/sessions')

		} else {
			let sessionsDb = db.collection('sessions')
			let session = sessionsDb.get(parseInt(req.query.id))

			prepareSession(session.cid, req.query, result => {
				if (result) {
					console.log("Download this file.")
					console.log(result)
					req.flash('success', { msg: session.name + ' downloaded.' })
				} else {
					req.flash('errors', { msg: session.name + ' not downloaded.' })
				}
				//res.redirect('/sessions')
				res.download(result)
			})
		}
	} else {
		res.redirect('/')
	}
}

exports.removeResult = (req, res) => {
	if (authentication(req)) {
		let sessionsDb = db.collection('sessions')

		let existingSession = sessionsDb.get(parseInt(req.query.id))
		if (existingSession) {
			existingSession.answers.forEach((ans, ansInd) => {
				console.log(typeof req.query.result + "==" + typeof ans._id)
				if (req.query.result == ans._id)
					existingSession.answers.splice(ansInd, 1)
			})
			if (sessionsDb.update(existingSession.cid, { answers: existingSession.answers })) {
				req.flash('success', { msg: 'Response is now removed.' })
				res.redirect('/session/results?id=' + existingSession.cid)
			} else {
				req.flash('errors', { msg: 'Response not removed.' })
				res.redirect('/session/results?id=' + existingSession.cid)
			}
		} else {
			req.flash('errors', { msg: 'Session not found' })
			req.redirect('/')
		}
	} else {
		res.redirect('/');
	}
}

exports.deleteSession = (req, res) => {
	if (authentication(req)) {
		let sessionsDb = db.collection('sessions')
		if (sessionsDb.remove(parseInt(req.query.id))) {
			req.flash('success', { msg: 'Session is now deleted.' });
			res.redirect('/sessions');
		} else {
			req.flash('errors', { msg: 'Something went wrong. Please try again.' });
			res.redirect('/sessions');
		}

	} else {
		res.redirect('/')
	}
}

exports.mergeSessions = (req, res) => {
	let sessionsDb = db.collection('sessions')
	let allSessions = sessionsDb.items
	let merge_name = req.body.merge_name
	let sessions_to_merge = []
	let sessions_ids = []
	let main_answers = []
	let questionnaire = 0

	if ('merge_sessions' in req.body) {	//check to see if user selected a session
		sessions_to_merge = req.body.merge_sessions
		questionnaire = parseInt(sessions_to_merge[0].split('_')[0])

		if (typeof sessions_to_merge == 'string') {	//check to see if user selected more than one session
			req.flash('errors', { msg: 'You need to select more than 1 session.' })
			return res.redirect('/sessions')
		}
	} else {
		req.flash('errors', { msg: 'No sessions selected.' })
		return res.redirect('/sessions')
	}

	sessions_to_merge.forEach(session => {	//check to see if user selected sessions with the same questionnaire
		if (parseInt(session.split('_')[0]) != questionnaire) {
			req.flash('errors', { msg: 'Unable to merge sessions with different questionnaire.' })
			return res.redirect('/sessions')
		} else {
			sessions_ids.push(parseInt(session.split('_')[1]))
		}
	})

	allSessions.forEach(item => {
		sessions_ids.forEach(id => {
			if (item.cid == id) {
				console.log("Answers count: " + item.answers.length)
				tempAns = item.answers.concat(main_answers)
				main_answers = tempAns
			}
		})
	})

	let newSession = {
		active: false,
		name: merge_name,
		questionnaire: questionnaire,
		createdTS: new Date().getTime(),
		createdAt: new Date().toUTCString(),
		answers: main_answers
	}

	let existingSessions = sessionsDb.where({ name: merge_name }).items
	if (existingSessions < 1) {
		if (sessionsDb.insert(newSession)) {
			req.flash('success', { msg: 'Sessions merged. New session created called "' + merge_name + "'" })
			res.redirect('/sessions')
		} else {
			req.flash('errors', { msg: 'Something went wrong. Please try again.' })
			res.redirect('/sessions')
		}
	} else {
		req.flash('errors', { msg: 'A session with that name already exists. Please choose another name.' })
		res.redirect('/sessions')
	}
}

/**
 * Teachers, subjects and sections
 */

exports.addTeacher = (req, res) => {
	if (authentication(req)) {
		let teachersDb = db.collection('teachers')

		if (!req.body.subjects) {
			subjects = []
		} else {
			if (typeof req.body.subjects == 'string')
				subjects = [req.body.subjects]
			else
				subjects = req.body.subjects
		}
		let teacher = {
			name: req.body.teacher_name,
			subjects: subjects
		}

		if (req.body.teacher_update)
			teacher.name = req.body.teacher_update

		let existingTeacher = teachersDb.where({ name: teacher.name }).items
		if (existingTeacher.length > 0) {
			//update a teacher
			newSubjects = removeDups(existingTeacher[0].subjects.concat(subjects).sort())
			if (teachersDb.update(existingTeacher[0].cid, { subjects: newSubjects })) {
				req.flash('success', { msg: 'Subjects for ' + teacher.name + '  updated.' });
				return res.redirect('/sessions');
			} else {
				req.flash('errors', { msg: 'Subjects not updated' })
				res.redirect('/sessions')
			}
		} else {
			//add new teacher
			if (teachersDb.insert(teacher)) {
				req.flash('success', { msg: 'Teacher ' + teacher.name + ' is now added.' });
				res.redirect('/sessions');
			} else {
				rf
				req.flash('errors', { msg: 'Teacher not added.' })
				res.redirect('/sessions')
			}
		}

	} else {
		res.redirect('/')
	}
}

exports.removeTeacher = (req, res) => {
	if (authentication(req)) {
		let teachersDb = db.collection('teachers')

		let existingTeacher = teachersDb.get(parseInt(req.query.id))
		if (existingTeacher) {
			if (teachersDb.remove(existingTeacher.cid)) {
				req.flash('success', { msg: 'Teacher ' + existingTeacher.name + ' removed.' })
				res.redirect('/sessions')
			} else {
				req.flash('errors', { msg: 'Teacher not removed.' })
				res.redirect('/sessions')
			}
		} else {
			req.flash('errors', { msg: 'Teacher not found.' })
			res.redirect('/sessions')
		}
	} else {
		res.redirect('/');
	}
}

exports.removeTeacherSubject = (req, res) => {
	if (authentication(req)) {
		let teachersDb = db.collection('teachers')

		let existingTeacher = teachersDb.get(parseInt(req.query.id))
		if (existingTeacher) {
			subjectList = existingTeacher.subjects
			subjectToRemove = subjectList[req.query.subject]
			subjectList.splice(req.query.subject, 1)
			if (teachersDb.update(existingTeacher.cid, { subjects: subjectList })) {
				req.flash('success', { msg: 'Subject ' + subjectToRemove + ' remove from ' + existingTeacher.name + 's subject list.' })
				res.redirect('/sessions')
			} else {
				req.flash('errors', { msg: 'Subject not removed from teachers list.' })
				res.redirect('/sessions')
			}
		} else {
			req.flash('errors', { msg: 'Teacher not found.' })
			res.redirect('/sessions')
		}
	} else {
		res.redirect('/');
	}
}

exports.addSubject = (req, res) => {
	if (authentication(req)) {
		let subjectsDb = db.collection('subjects')
		let subject = {
			name: req.body.subject_name,
			sections: []
		}
		let existingSubject = subjectsDb.where({ name: req.body.subject_name }).items
		if (existingSubject.length > 0) {
			req.flash('errors', { msg: 'Subject already exists.' })
			res.redirect('/subjects')
		} else {
			if (subjectsDb.insert(subject)) {
				req.flash('success', { msg: 'Subject ' + existingSubject.name + ' is now added.' })
				res.redirect('/subjects')
			} else {
				req.flash('errors', { msg: 'Subject not added' })
				res.redirect('/subjects')
			}
		}
	} else {
		res.redirect('/');
	}
}

exports.removeSubject = (req, res) => {
	if (authentication(req)) {
		let subjectsDb = db.collection('subjects')

		let existingSubject = subjectsDb.get(parseInt(req.query.id))
		if (existingSubject) {
			if (subjectsDb.remove(existingSubject.cid)) {
				req.flash('success', { msg: 'Subject ' + existingSubject.name + ' removed.' })
				res.redirect('/subjects')
			}
		} else {
			req.flash('errors', { msg: 'Subject no found.' })
			res.redirect('/subjects')
		}
	} else {
		res.redirect('/');
	}
}

exports.addSection = (req, res) => {
	if (authentication(req)) {
		let subjectsDb = db.collection('subjects')

		let existingSubject = subjectsDb.get(parseInt(req.body.section_subject))
		if (existingSubject) {
			existingSections = existingSubject.sections
			if (existingSections.indexOf(req.body.section_name) > -1) {
				req.flash('errors', { msg: 'Section ' + req.body.section_name + ' already exists.' })
				res.redirect('/subjects')
			} else {
				existingSections.push(req.body.section_name)
				if (subjectsDb.update(existingSubject.cid, { sections: existingSections })) {
					req.flash('success', { msg: 'Section ' + req.body.section_name + ' is now added to ' + existingSections.name + ' subject.' })
					res.redirect('/subjects')
				} else {
					req.flash('errors', { msg: 'Section is not added.' })
					res.redirect('/subjects')
				}
			}
		} else {
			req.flash('errors', { msg: 'Subject not found.' })
			res.redirect('/subjects')
		}
	} else {
		res.redirect('/');
	}
}

exports.removeSection = (req, res) => {
	if (authentication(req)) {
		let subjectsDb = db.collection('subjects')

		let existingSubject = subjectsDb.get(parseInt(req.query.id))
		if (existingSubject) {
			sections = existingSubject.sections
			sections.splice(sections.indexOf(req.query.name), 1)
			if (subjectsDb.update(existingSubject.cid, { sections: sections })) {
				req.flash('success', { msg: 'Section ' + req.query.name + ' is now removed from ' + existingSubject.name + ' subject.' });
				return res.redirect('/subjects');
			} else {
				req.flash('errors', { msg: 'Section is not removed.' })
				res.redirect('/subjects')
			}
		} else {
			req.flash('errors', { msg: 'Subject not found.' })
			res.redirect('/subjects')
		}
	} else {
		res.redirect('/');
	}
}
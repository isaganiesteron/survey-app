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
	const wb = new xl.Workbook()
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
			horizontal: 'center'
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

	data[1].forEach(teacher => {
		let curTeacher = wb.addWorksheet(teacher.name)
		curTeacher.column(2).setWidth(105)
		curTeacher.column(3).setWidth(15)
		curTeacher.column(4).setWidth(15)
		curTeacher.column(5).setWidth(15)
		curTeacher.column(6).setWidth(15)
		curTeacher.column(7).setWidth(15)
		curTeacher.column(8).setWidth(15)
		curTeacher.column(9).setWidth(15)
		curTeacher.column(10).setWidth(15)
		curTeacher.column(11).setWidth(15)
		curTeacher.column(12).setWidth(15)
		curTeacher.cell(1, 1).string(teacher.name)
		curTeacher.cell(3, 2).string("Questions").style({ alignment: { horizontal: 'center' } })
		curTeacher.cell(24, 2).string("Section Average").style(style2)
		curTeacher.cell(26, 2).string("Subject Average").style(style2)
		curTeacher.cell(28, 2).string("Total Average").style(style2)
		curTeacher.cell(28, 3).formula('=AVERAGE(C26:ZZ26)').style(style4)
		curTeacher.cell(31, 2).string("Remarks").style({ alignment: { horizontal: 'center' } })

		data[0].questions.forEach(cat => {
			cat.questions.forEach((quest, questInd) => {
				if (quest.type == 'choice') {
					curTeacher.cell(((questInd + 1) + 3), 1).number((questInd + 1))
					curTeacher.cell(((questInd + 1) + 3), 2).string(quest.question)
				}
			})
		})

		columnCount = 0
		remarks = []
		teacher.subjects.forEach(sub => {
			curTeacher.cell(2, (columnCount + 3), 2, ((columnCount + 2) + sub.sections.length), true).string(sub.name).style(style7)
			subColStart = columnCount
			subColEnd = 0
			sub.sections.forEach(sec => {
				curTeacher.cell(3, (columnCount + 3)).string(sec.name).style({ alignment: { horizontal: 'center' } }).style(style8)
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
					curTeacher.cell((4 + i), (columnCount + 3)).number(curAve).style(style6)
					if (i == 19) {
						curTeacher.cell((5 + i), (columnCount + 3)).formula('=AVERAGE(' + cols[columnCount + 2] + '4:' + cols[columnCount + 2] + '23)').style(style3) //current section average
						curTeacher.cell(((5 + i) + 1), (columnCount + 3)).string("Based on " + sec.answers.length + " responses").style(style5) //number of responders in this section
						subColEnd = columnCount + 1
					}
				}
				columnCount++
			})

			curTeacher.cell(26, (subColStart + 3), 26, ((subColStart + 3) + sub.sections.length - 1), true).formula('=AVERAGE(' + cols[(columnCount + 1)] + '24:' + cols[subColEnd] + '24)').style(style3) //current section average

			columnCount++
		})
		curTeacher.cell(1, 1, 1, (columnCount + 1), true).string(teacher.name).style(style1)

		remarks.forEach((rem, remInd) => {
			curTeacher.cell((32 + remInd), 2).string("'" + rem + "'").style({ font: { italics: true } })
		})
	})

	wb.write('output/' + data[2] + '.xlsx', function (err, stats) {
		if (err) {
			cb(false)
		} else {
			cb(true)
		}
	});
}

function prepareSession(id, createfile, cb) {
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
		if (createfile) {
			writeSpreadsheet([questions, overallAnsList, existingSession.name], (writeRes) => {
				if (cb)
					cb(writeRes)
			})
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

exports.index = (req, res) => {
	if (authentication(req)) {
		let questionsDb = db.collection('questions')
		let sessionsDb = db.collection('sessions')
		let teachersDb = db.collection('teachers')
		let subjectsDb = db.collection('subjects')

		let allSessions = sessionsDb.items
		let allQuestions = questionsDb.items
		let allTeachers = teachersDb.items
		let allSubjects = subjectsDb.items

		allSessions.sort(function (a, b) { return (b.createdTS * 1) - (a.createdTS * 1) })
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

		res.render('admin', {
			title: 'admin',
			sessions: allSessions,
			surveys: allQuestions,
			teachers: allTeachers,
			subjects: allSubjects
		});
	} else {
		res.redirect('/login');
	}
};


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
				res.redirect('/admin');
			} else {
				req.flash('errors', { msg: 'Something went wrong. Please try again.' });
				res.redirect('/admin');
			}

		} else {
			req.flash('errors', { msg: 'A session is currently active. End the current session before starting a new one.' });
			res.redirect('/admin');
		}

	} else {
		res.redirect('/')
	}
}

exports.continueSession = (req, res) => {
	if (authentication(req)) {
		let sessionsDb = db.collection('sessions')

		let existingSession = sessionsDb.where({ active: true }).items
		if (existingSession.length > 0) {
			req.flash('errors', { msg: 'A session is currently active. End the current session before starting a new one.' });
			res.redirect('/admin');
		} else {
			if (sessionsDb.update(parseInt(req.query.id), { active: true })) {
				req.flash('success', { msg: 'Session is now active.' });
				return res.redirect('/admin');
			} else {
				req.flash('errors', { msg: 'Something went wrong. Please try again.' });
				res.redirect('/admin');
			}
		}
	} else {
		res.redirect('/');
	}
}

exports.endSession = (req, res) => {
	if (authentication(req)) {
		let sessionsDb = db.collection('sessions')
		if (sessionsDb.update(parseInt(req.query.id), { active: false })) {
			req.flash('success', { msg: 'Session is now inactive.' });
			res.redirect('/admin');
		} else {
			req.flash('errors', { msg: 'Something went wrong. Please try again.' });
			res.redirect('/admin');
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
			res.redirect('/admin');
		} else {
			req.flash('errors', { msg: 'Something went wrong. Please try again.' });
			res.redirect('/admin');
		}

	} else {
		res.redirect('/')
	}
}
/**
 * Display Results
 */

exports.displaySingleResult = (req, res) => {
	if (authentication(req)) {
		let questionsDb = db.collection('questions')
		let sessionsDb = db.collection('sessions')

		let currentSession = sessionsDb.get(parseInt(req.query.id))
		if (currentSession) {
			let questions = questionsDb.get(parseInt(currentSession.questionnaire))
			res.render('results', {
				title: "Single result for response [" + currentSession.cid + "]",
				questions: questions,
				session: currentSession
			})
		} else {
			req.flash('errors', { msg: "No session found." })
			res.redirect('/admin')
		}
	} else {
		res.redirect('/');
	}
}

exports.displayResults = (req, res) => {
	if (authentication(req)) {
		prepareSession(parseInt(req.query.id), false, (session) => {
			if (session) {
				result = []
				session.organized_list.forEach(teacher => {
					getAverageScore(session.questions, teacher.answers, (data) => {
						teacher_data = {
							name: teacher.name,
							score: data,
							subjects: []
						}
						teacher.subjects.forEach(subjects => {
							getAverageScore(session.questions, subjects.answers, (subjectData) => {
								temp_subjects = {
									name: subjects.name,
									score: subjectData,
									sections: []
								}
								subjects.sections.forEach(section => {
									getAverageScore(session.questions, section.answers, (sectionData) => {
										temp_sections = {
											name: section.name,
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

				res.render('results_test', {
					title: "Results - " + req.query.id,
					session: session.session,
					summary: result
				});
				return
				res.render('results_test', {
					title: "Results - " + req.query.id,
					session: {
						id: results.session.cid,
						status: results.session.active,
						questionnaire: "questionnaire",
						responders: results.answer_list.length,
						name: results.session.name,
						date: results.session.createdAt
					},
					data: {
						raw: results.answer_list,
						organized: results.organized_list
					}
				});
			}
		})
		return

		let questionsDb = db.collection('questions')
		let sessionsDb = db.collection('sessions')
		let teachersDb = db.collection('teachers')
		let subjectsDb = db.collection('subjects')

		let existingSession = sessionsDb.get(parseInt(req.query.id))
		//let ansList = existingSession.answers
		let subjects = subjectsDb.items
		let questions = questionsDb.items
		let teachers = teachersDb.items

		/*
    let organizedList = []
    let teachList = []
    let subjectList = []
    let sectionList = []
		*/

		single = req.query.single || false //for single responder view
		teacher = req.query.teacher || false //for view based on teacher
		subject = req.query.subject || false //for view based on subject
		section = req.query.section || false //for view based on subject

		if (existingSession) {
			let teachList = []
			let subjectList = []
			let sectionList = []
			let includedTeachers = []
			let ansList = []

			existingSession.answers.forEach((ans) => {
				if (teachList.indexOf(ans.evaluator_0) < 0)
					teachList.push(ans.evaluator_0)
				if (subjectList.indexOf(ans.evaluator_1) < 0)
					subjectList.push(ans.evaluator_1)
				if (sectionList.indexOf(ans.evaluator_2) < 0)
					sectionList.push(ans.evaluator_2)

				teachList.sort()

				if (single) {
					if (ans._id == single)
						ansList.push(ans)
				} else if (teacher) {
					if (subject && section) {
						if (ans.evaluator_0 == teachList.find((teach) => { return teach == teacher }) && ans.evaluator_1 == subject && ans.evaluator_2 == section)
							ansList.push(ans)

					} else if (subject || section) {
						if (subject) {
							if (ans.evaluator_0 == teachList.find((teach) => { return teach == teacher }) && ans.evaluator_1 == subject)
								ansList.push(ans)
						} else {
							if (ans.evaluator_0 == teachList.find((teach) => { return teach == teacher }) && ans.evaluator_2 == section)
								ansList.push(ans)
						}
					} else {
						if (ans.evaluator_0 == teachList.find((teach) => { return teach == teacher }))
							ansList.push(ans)
					}
				} else {
					ansList = []
				}
			})

			teachers.forEach((teach) => {
				if (teachList.indexOf(teach.name) > -1)
					includedTeachers.push(teach)
			})
			includedTeachers.sort((a, b) => {
				if (a.name < b.name) { return -1 }
				if (a.name > b.name) { return 1 }
				return 0
			})

			let page = 'results'
			if (req.query.print)
				page = 'print'

			res.render(page, {
				title: "Results - " + existingSession.cid,
				questions: questions[0],
				session: existingSession,
				teachers: teachList,
				sections: sectionList,
				subjectsObject: subjects,
				subjects: subjectList,
				filteredAnswerList: ansList,
				fullAnswerList: existingSession.answers,
				filter: [single, teacher, subject, section]
			});
		} else {
			req.flash('errors', { msg: 'No session found.' });
			res.redirect('/admin');
		}
	} else {
		res.redirect('/');
	}
}

exports.downloadResults = (req, res) => {
	if (authentication(req)) {
		if (req.query.id == 'all') {

			let sessionsDb = db.collection('sessions')
			let allSessions = sessionsDb.items
			resString = ""
			allSessions.forEach(session => {
				prepareSession(session.cid, false, false)
			})
			req.flash('success', { msg: 'All session files reloaded.' })
			res.redirect('/admin')

		} else {
			let sessionsDb = db.collection('sessions')
			let session = sessionsDb.get(parseInt(req.query.id))
			prepareSession(session.cid, false, result => {
				if (result)
					req.flash('success', { msg: session.name + ' downloaded.' })
				else
					req.flash('errors', { msg: session.name + ' not downloaded.' })
				res.redirect('/admin')
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
				if (req.query.result == ans.id)
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
				return res.redirect('/admin');
			} else {
				req.flash('errors', { msg: 'Subjects not updated' })
				res.redirect('/admin')
			}
		} else {
			//add new teacher
			if (teachersDb.insert(teacher)) {
				req.flash('success', { msg: 'Teacher ' + teacher.name + ' is now added.' });
				res.redirect('/admin');
			} else {
				req.flash('errors', { msg: 'Teacher not added.' })
				res.redirect('/admin')
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
				res.redirect('/admin')
			} else {
				req.flash('errors', { msg: 'Teacher not removed.' })
				res.redirect('/admin')
			}
		} else {
			req.flash('errors', { msg: 'Teacher not found.' })
			res.redirect('/admin')
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
			res.redirect('/admin')
		} else {
			if (subjectsDb.insert(subject)) {
				req.flash('success', { msg: 'Subject ' + existingSubject.name + ' is now added.' })
				res.redirect('/admin')
			} else {
				req.flash('errors', { msg: 'Subject not added' })
				res.redirect('/admin')
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
				res.redirect('/admin')
			}
		} else {
			req.flash('errors', { msg: 'Subject no found.' })
			res.redirect('/admin')
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
				res.redirect('/admin')
			} else {
				req.flash('errors', { msg: 'Subject not removed from teachers list.' })
				res.redirect('/admin')
			}
		} else {
			req.flash('errors', { msg: 'Teacher not found.' })
			res.redirect('/admin')
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
				res.redirect('/admin')
			} else {
				existingSections.push(req.body.section_name)
				if (subjectsDb.update(existingSubject.cid, { sections: existingSections })) {
					req.flash('success', { msg: 'Section ' + req.body.section_name + ' is now added to ' + existingSections.name + ' subject.' })
					res.redirect('/admin')
				} else {
					req.flash('errors', { msg: 'Section is not added.' })
					res.redirect('/admin')
				}
			}
		} else {
			req.flash('errors', { msg: 'Subject not found.' })
			res.redirect('/admin')
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
				return res.redirect('/admin');
			} else {
				req.flash('errors', { msg: 'Section is not removed.' })
				res.redirect('/admin')
			}
		} else {
			req.flash('errors', { msg: 'Subject not found.' })
			res.redirect('/admin')
		}
	} else {
		res.redirect('/');
	}
}

function getAverageScore(questionSet, answerList, next) {

	//use questions set to determine what to average

	/**
	 * questions: [] these are categories
	 * 	each cateogory has questions
	 * 		filter each question based on if its "choice" this will include it in the overall score
	 */

	questionPointers = []
	questionSet.questions.forEach((cat, catInd) => {
		curPointer = "q_" + catInd
		cat.questions.forEach((ques, questInd) => {
			if ('choices' in ques) {
				if (ques.choices.length > 0)
					questionPointers.push(curPointer + '_' + questInd)
			}
		})
	})

	ansTotal = 0
	ansCount = 0
	answerList.forEach(ans => {
		curAnsTotal = 0
		curAnsCount = 0
		questionPointers.forEach((items, itemsInd) => {
			curAnsTotal += (ans[items] * 1)
			curAnsCount++
		})
		ansTotal += (curAnsTotal / curAnsCount)
		ansCount++
	})
	next({
		total: ansTotal,
		count: ansCount
	})
}
//mergeAllSessions()
function mergeAllSessions() {
	/**
	 * create main session
	 * scan through all the sessions
	 * push all answers into main session
	 * done
	 */

	let sessionsDb = db.collection('sessions')

	let allSession = sessionsDb.items
	let allAnswers = []
	allSession.forEach(item => {
		tempAns = item.answers.concat(allAnswers)
		allAnswers = tempAns
	})

	console.log(allAnswers.length)

	if (sessionsDb.update(22, { answers: allAnswers })) {  //return true if succesfully inserted
		console.log("DONE")
	}
}


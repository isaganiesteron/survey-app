/* eslint-env jquery, browser */
$(document).ready(() => {
	getOptions()
	$('.subject_choice').hide()
	$('.section_choice').hide()

	$.fn.scrollView = function () {
		return this.each(function () {
			$('html, body').animate({
				scrollTop: $(this).offset().top
			}, 1000)
		})
	}

	$('.form-control').change(function () {
		if ($(this)[0].name == 'evaluator_0') {
			chosenTeacher = $(this)[0].value.replace(/ /g, '_').toLowerCase()
			$('.subject_choice').each((ind, curr) => {
				$(curr)[0].classList.forEach((cur) => {
					if (cur == chosenTeacher + '_subjects')
						$(curr).show()
					else
						$(curr).hide()
				})
			})
		}
		if ($(this)[0].name == 'evaluator_1') {
			chosenSection = $(this)[0].value.replace(/ /g, '_').toLowerCase()
			$('.section_choice').each((ind, curr) => {
				$(curr)[0].classList.forEach((cur) => {
					if (cur == chosenSection + '_sections')
						$(curr).show()
					else
						$(curr).hide()
				})
			})
		}
	})
	if (window.location.href.search('teacher') > -1 || window.location.href.search('single') > -1) {
		$('#results_area').scrollView()
	}
	$(".table-row").click(function () {
		window.document.location = $(this).data("href")
	})

	$(".confirm_yes").on("click", function () {
		window.document.location = $(this).data("href")
	})

	$("#download_options_toggle").click(function () {
		$("div#download_options").toggle()
	})

	$(".download_option").change(fixLinks)

	if ($("#download_options").length == 1)
		fixLinks()
})
function fixLinks() {
	console.log("fixLinks")
	$(".download_link").each((linkInd, link) => {
		curr_addr = $(link).prop("href")
		addr = curr_addr.split("id=")[0]
		id = curr_addr.split("id=")[1]
		if (id.indexOf("&") > 0)
			id = id.split("&")[0]

		orig_addr = addr + "id=" + id
		setOptions()
		$(link).prop("href", orig_addr + localStorage.getItem("download_options"))
	})
}
function getOptions() {
	if ($("#download_options").length == 1) {
		if (localStorage.getItem("download_options") == null) {
			setOptions()
		} else {
			console.log(localStorage.getItem("download_options"))
			options = localStorage.getItem("download_options").split("&")
			options.forEach(opt => {
				cur = opt.split("=")
				if (cur[0] == "mode") {
					if (cur[1] == "print") {
						$("#options_print").prop("checked", true)
						$("#options_email").prop("checked", false)
					} else {
						$("#options_print").prop("checked", false)
						$("#options_email").prop("checked", true)
					}
				}
				/*
				if (cur[0] == "remarks") {
					if (cur[1] == "false")
						$("#options_remarks").prop("checked", false)
					else
						$("#options_remarks").prop("checked", true)
				}
				if (cur[0] == "top")
					$("#options_margin_top").val(cur[1])

				if (cur[0] == "bottom")
					$("#options_margin_bottom").val(cur[1])

				if (cur[0] == "right")
					$("#options_margin_right").val(cur[1])

				if (cur[0] == "left")
					$("#options_margin_left").val(cur[1])
				*/
			})
		}
	}
}
function setOptions() {
	download_link = ""
	if ($("#options_print").is(':checked'))
		download_link += "&mode=print"
	else
		download_link += "&mode=email"
	/*
	if ($("#options_remarks").is(':checked'))
		download_link += "&remarks=true"
	else
		download_link += "&remarks=false"
	download_link += "&top=" + $("#options_margin_top").val()
	download_link += "&bottom=" + $("#options_margin_bottom").val()
	download_link += "&right=" + $("#options_margin_right").val()
	download_link += "&left=" + $("#options_margin_left").val()
	*/
	localStorage.setItem("download_options", download_link)
}

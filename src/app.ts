'use strict' 

interface ItemFinder { (list: Array<any>, item: any): boolean }
interface StringModifier { (str: string): string }
interface ElementGetter { (name: string): Element }
interface NodeListGetter {
	(el: Document|HTMLElement|Element, name: string): NodeListOf<Element>
}
interface HTMLCollectionGetter {
	(el: Document|HTMLElement|Element, name: string): HTMLCollectionOf<Element>| any
}
interface ElementSetter {
	(el: HTMLElement|Element, name: string): void
}
interface ElementModifier {
	(el: HTMLElement, name: any): HTMLElement
}
interface ElementCreator { (name: string): HTMLElement}

const found: ItemFinder = (list, item) => list.indexOf(item) > -1
const isoToDate: StringModifier = str => new Date(str).toLocaleDateString().replace(/\//g,'/')
const toShortDate: StringModifier = str => `(${new Date(str).getMonth()+1}/${new Date(str).getFullYear()})`
const id: ElementGetter = name => document.getElementById(name)
const tags: HTMLCollectionGetter = (el, name) => el.getElementsByTagName(name)
const createElement: ElementCreator = (name) => document.createElement(name)
const addClass: ElementSetter = (el, name) => el.classList.add(name)
const setElementText: ElementModifier = (el, name) => {
	el.textContent = name
	return el
}
const setElementAttributes: ElementModifier = (el, name: any) => {
	for (const prop in name) {
		const val = name[prop]
		el.setAttribute(prop, val)
	}
	return el
}

const E = (str: string, attrs = undefined, txt: string = undefined): HTMLElement => {
	const el = createElement(str)
	attrs && setElementAttributes(el, attrs)
	txt && setElementText(el, txt)
	return el
}
const createFragment = (): DocumentFragment => document.createDocumentFragment()
const replaceNode = (oldEl, newEl) => oldEl.parentNode.replaceChild(newEl, oldEl)
const prependElement = (parentEl, childEl) => parentEl.insertBefore(childEl, parentEl.firstChild)
const appendElement = (parentEl, childEl) => parentEl.appendChild(childEl)
const render = (data, fn): ChildNode => document.createRange().createContextualFragment(fn(data)).firstChild
const setBGUrl = (url, size = 'contain') => `
	background: url(${url}) no-repeat;
	background-size: ${size} !important
`
const getProp = (computedStyle, prop): string => String(computedStyle.getPropertyValue(prop)).trim()
const setProp = (el, prop, val) => el.style.setProperty(prop, val)
const setProps = (el, obj) => {
	for (const prop in obj) {
		const val = obj[prop]
		el.style.setProperty(prop, val)
	}
	return el
}

const isInView = (el, visible = ''): boolean => {
	const 
		{ top, bottom } = el.getBoundingClientRect(),
		{ innerHeight: height } = window

	return visible === 'partial' ? 
		top < height && (bottom >= 0) :
		top >= 0 && (bottom <= height)
}

const paint = () => {
	const elems = tags(document, 'course')
	for (const el of elems) {
		const check = setInterval(() => {
			if (isInView(el, 'partial')) {
				let delay = 1000
				const
					skills = tags(el, 'skill'),
					total = skills.length
							
				for (const skill of skills) {
					setTimeout(() => {
						addClass(tags(skill, 'icon')[0], 'enter')
					}, delay)
					
					delay *= .9
				}
				
				setProp(el, '--badge-count', `'${total}'`)
				addClass(el, 'reveal')
				clearInterval(check)
			}
		}, 50)
	}
}
			
const conceive = (data) => {
	let courses = [], badges = []
	const { badges: badgeCollection } = data
	const welcome = id('welcome')
	const fragment = createFragment()
	
	for (const badge of badgeCollection) {
		let dateEarned = badge.earned_date
		const isCourse = badge.courses.length
		
		// if this is a course and the title is in the courses list
		if (isCourse && found(courses, badge.courses[0].title)) {
			const { title } = badge.courses[0]
			const course = fragment.childNodes[courses.indexOf(title)]
			
			// construct dom: append rendered element to the course
			appendElement(course, 
				render(badge, ({name, icon_url, url}) => {
					const badgeBGImage = setBGUrl(icon_url)
					return (
						`<skill>
							<icon style='${badgeBGImage}'></icon>
							<a href=${url} title='view course stage'>
								${name}
							</a>
						</skill>`
					)
				})
			)
			
			// update list/ count of acheivements
			badges = [badge.name, ...badges] 
			
			// set css variables on this course
			setProps(course, {
					['--total-courses']: `'${courses.length}'`,
					['--total-badges']: `'${badges.length}'`,
					['--date']: `'${isoToDate(dateEarned)}'`
				}
			)
			
		} // end if
		
		// if this is a course and the title isnt in the courses list
		if (isCourse && !found(courses, badge.courses[0].title)) {
			let course = undefined
			const { title } = badge.courses[0]
			
			// construct dom
			prependElement(fragment, 
				render([data, badge], ([{ profile_url, name: username }, { name, url, icon_url, courses }]) => {
					const { title, url: course_url } = courses[0]
					return ( 
						`<course>
							<a href=${profile_url} class='profile' title='view ${username}'s profile'>
								${username}
							</a>
							<a href=${course_url}>${title}</a>
							<skill>
								<icon style='${setBGUrl(icon_url)}'></icon>
								<a href=${url} title='view course stage'>${name}</a>
							</skill>
						</course>`
					)
				})
			)
			
			// update variables
			courses = [title, ...courses] // add the title of course to course list
			badges = [badge.name, ...badges]
			
			// set css variables on this course
			course = fragment.firstChild
			setProps(course, {
					['--total-courses']: `'${courses.length}'`,
					['--total-badges']: `'${badges.length}'`,
					['--date']: `'${isoToDate(dateEarned)}'`
				}
			)
			
		} // end if
			
	} // end for of
	
	// add dom fragment to dom
	replaceNode(welcome, fragment)
	
	// animate
	paint()
}

const request = (url, fn) => {
	let num: any = 100 // percent difference
	const loader = id('loader')
	const computedStyle = getComputedStyle(loader)
	const req = new XMLHttpRequest()
	const progress = () => {
			const computedValue = getProp(computedStyle, '--progress')
			num *= +computedValue < 50 ? .9 : .6
			setProps(loader, {
				['--progress']: num,
				['--percent']: `'${100-num.toFixed(0)}'`
			})
		}
	const loading = setInterval(progress, 300)
	
	req.open("GET", url, true)
	req.onload = () => {
		const statusIsGood = req.status >= 200 && req.status < 400
		if (statusIsGood) { fn(JSON.parse(req.responseText)) }
		setProps(loader, {
			['--progress']: 0,
			['--percent']: `'${100}'`,
			['--color']: '#f5f5f5'
		})
		clearInterval(loading)
	}
	req.send()
} 

request('https://teamtreehouse.com/abrahamjuliot.json', conceive)
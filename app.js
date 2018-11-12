'use strict';
var found = function (list, item) { return list.indexOf(item) > -1; };
var isoToDate = function (str) { return new Date(str).toLocaleDateString().replace(/\//g, '/'); };
var toShortDate = function (str) { return "(" + (new Date(str).getMonth() + 1) + "/" + new Date(str).getFullYear() + ")"; };
var id = function (name) { return document.getElementById(name); };
var tags = function (el, name) { return el.getElementsByTagName(name); };
var createElement = function (name) { return document.createElement(name); };
var addClass = function (el, name) { return el.classList.add(name); };
var setElementText = function (el, name) {
    el.textContent = name;
    return el;
};
var setElementAttributes = function (el, name) {
    for (var prop in name) {
        var val = name[prop];
        el.setAttribute(prop, val);
    }
    return el;
};
var E = function (str, attrs, txt) {
    if (attrs === void 0) { attrs = undefined; }
    if (txt === void 0) { txt = undefined; }
    var el = createElement(str);
    attrs && setElementAttributes(el, attrs);
    txt && setElementText(el, txt);
    return el;
};
var createFragment = function () { return document.createDocumentFragment(); };
var replaceNode = function (oldEl, newEl) { return oldEl.parentNode.replaceChild(newEl, oldEl); };
var prependElement = function (parentEl, childEl) { return parentEl.insertBefore(childEl, parentEl.firstChild); };
var appendElement = function (parentEl, childEl) { return parentEl.appendChild(childEl); };
var render = function (data, fn) { return document.createRange().createContextualFragment(fn(data)).firstChild; };
var setBGUrl = function (url, size) {
    if (size === void 0) { size = 'contain'; }
    return "\n\tbackground: url(" + url + ") no-repeat;\n\tbackground-size: " + size + " !important\n";
};
var getProp = function (computedStyle, prop) { return String(computedStyle.getPropertyValue(prop)).trim(); };
var setProp = function (el, prop, val) { return el.style.setProperty(prop, val); };
var setProps = function (el, obj) {
    for (var prop in obj) {
        var val = obj[prop];
        el.style.setProperty(prop, val);
    }
    return el;
};
var isInView = function (el, visible) {
    if (visible === void 0) { visible = ''; }
    var _a = el.getBoundingClientRect(), top = _a.top, bottom = _a.bottom, height = window.innerHeight;
    return visible === 'partial' ?
        top < height && (bottom >= 0) :
        top >= 0 && (bottom <= height);
};
var paint = function () {
    var elems = tags(document, 'course');
    var _loop_1 = function (el) {
        var check = setInterval(function () {
            if (isInView(el, 'partial')) {
                var delay = 1000;
                var skills = tags(el, 'skill'), total = skills.length;
                var _loop_2 = function (skill) {
                    setTimeout(function () {
                        addClass(tags(skill, 'icon')[0], 'enter');
                    }, delay);
                    delay *= .9;
                };
                for (var _i = 0, skills_1 = skills; _i < skills_1.length; _i++) {
                    var skill = skills_1[_i];
                    _loop_2(skill);
                }
                setProp(el, '--badge-count', "'" + total + "'");
                addClass(el, 'reveal');
                clearInterval(check);
            }
        }, 50);
    };
    for (var _i = 0, elems_1 = elems; _i < elems_1.length; _i++) {
        var el = elems_1[_i];
        _loop_1(el);
    }
};
var conceive = function (data) {
    var _a, _b;
    var courses = [], badges = [];
    var badgeCollection = data.badges;
    var welcome = id('welcome');
    var fragment = createFragment();
    for (var _i = 0, badgeCollection_1 = badgeCollection; _i < badgeCollection_1.length; _i++) {
        var badge = badgeCollection_1[_i];
        var dateEarned = badge.earned_date;
        var isCourse = badge.courses.length;
        // if this is a course and the title is in the courses list
        if (isCourse && found(courses, badge.courses[0].title)) {
            var title = badge.courses[0].title;
            var course = fragment.childNodes[courses.indexOf(title)];
            // construct dom: append rendered element to the course
            appendElement(course, render(badge, function (_a) {
                var name = _a.name, icon_url = _a.icon_url, url = _a.url;
                var badgeBGImage = setBGUrl(icon_url);
                return ("<skill>\n\t\t\t\t\t\t\t<icon style='" + badgeBGImage + "'></icon>\n\t\t\t\t\t\t\t<a href=" + url + " title='view course stage'>\n\t\t\t\t\t\t\t\t" + name + "\n\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t</skill>");
            }));
            // update list/ count of acheivements
            badges = [badge.name].concat(badges);
            // set css variables on this course
            setProps(course, (_a = {},
                _a['--total-courses'] = "'" + courses.length + "'",
                _a['--total-badges'] = "'" + badges.length + "'",
                _a['--date'] = "'" + isoToDate(dateEarned) + "'",
                _a));
        } // end if
        // if this is a course and the title isnt in the courses list
        if (isCourse && !found(courses, badge.courses[0].title)) {
            var course = undefined;
            var title = badge.courses[0].title;
            // construct dom
            prependElement(fragment, render([data, badge], function (_a) {
                var _b = _a[0], profile_url = _b.profile_url, username = _b.name, _c = _a[1], name = _c.name, url = _c.url, icon_url = _c.icon_url, courses = _c.courses;
                var _d = courses[0], title = _d.title, course_url = _d.url;
                return ("<course>\n\t\t\t\t\t\t\t<a href=" + profile_url + " class='profile' title='view " + username + "'s profile'>\n\t\t\t\t\t\t\t\t" + username + "\n\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t<a href=" + course_url + ">" + title + "</a>\n\t\t\t\t\t\t\t<skill>\n\t\t\t\t\t\t\t\t<icon style='" + setBGUrl(icon_url) + "'></icon>\n\t\t\t\t\t\t\t\t<a href=" + url + " title='view course stage'>" + name + "</a>\n\t\t\t\t\t\t\t</skill>\n\t\t\t\t\t\t</course>");
            }));
            // update variables
            courses = [title].concat(courses); // add the title of course to course list
            badges = [badge.name].concat(badges);
            // set css variables on this course
            course = fragment.firstChild;
            setProps(course, (_b = {},
                _b['--total-courses'] = "'" + courses.length + "'",
                _b['--total-badges'] = "'" + badges.length + "'",
                _b['--date'] = "'" + isoToDate(dateEarned) + "'",
                _b));
        } // end if
    } // end for of
    // add dom fragment to dom
    replaceNode(welcome, fragment);
    // animate
    paint();
};
var request = function (url, fn) {
    var num = 100; // percent difference
    var loader = id('loader');
    var computedStyle = getComputedStyle(loader);
    var req = new XMLHttpRequest();
    var progress = function () {
        var _a;
        var computedValue = getProp(computedStyle, '--progress');
        num *= +computedValue < 50 ? .9 : .6;
        setProps(loader, (_a = {},
            _a['--progress'] = num,
            _a['--percent'] = "'" + (100 - num.toFixed(0)) + "'",
            _a));
    };
    var loading = setInterval(progress, 300);
    req.open("GET", url, true);
    req.onload = function () {
        var _a;
        var statusIsGood = req.status >= 200 && req.status < 400;
        if (statusIsGood) {
            fn(JSON.parse(req.responseText));
        }
        setProps(loader, (_a = {},
            _a['--progress'] = 0,
            _a['--percent'] = "'" + 100 + "'",
            _a['--color'] = '#f5f5f5',
            _a));
        clearInterval(loading);
    };
    req.send();
};
request('https://teamtreehouse.com/abrahamjuliot.json', conceive);

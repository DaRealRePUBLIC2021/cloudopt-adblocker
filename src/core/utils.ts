import _ from 'lodash'
import * as api from './api'
import * as store from './store'
import * as coreConfig from './config'

export const URL_REGEX = /((https|http|ftp|rtsp|mms):\/\/)?(([0-9a-z_!~*'().&=+$%-]+:)?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+\/?)/g

declare global {
    /* tslint:disable */
    interface Array<T> {
        removeByValue(val: T): T[]
        inArray(val: T): boolean
        last(): T
    }
    interface Window {
        adguardApi?: any
    }
    interface Navigator {
        browserLanguage?: string
    }
    /* tslint:enable */
}

if (!Array.prototype.removeByValue) {
    Array.prototype.removeByValue = function<T> (val: T): T[] {
        return this.filter((elem) => elem !== val)
    }
}

if (!Array.prototype.inArray) {
    Array.prototype.inArray = function<T> (val: T): boolean {
        if (typeof val === 'string' || typeof val === 'number') {
            return this.some((elem) => val === elem)
        } else {
            return this.some((elem) => _.isEqual(val, elem))
        }
    }
}

if (!Array.prototype.last) {
    Array.prototype.last = function<T> (): T[] {
        return this[this.length - 1]
    }
}

export function getQueryString(name: string): string {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`)
    const r = window.location.search.substr(1).match(reg)
    if (r != null) {
        return unescape(r[2])
    }
    return null
}

export function compareDate(a: string, b: string): boolean {
    return Math.abs((new Date().valueOf() - new Date(a).valueOf()) / (1000 * 60 * 60 * 24)) <= parseInt(b, 10)
}

export function getHost(website: string): string {
    website = website.replace('http://', '')
    website = website.replace('https://', '')
    website = website.split('/')[0]
    website = website.split('?')[0]
    website = website.split('#')[0]
    website = website.split('#!')[0]
    website = website.split(':')[0]
    return website
}

export function getPort(website: string): string {
    website = website.replace('http://', '')
    website = website.replace('https://', '')
    website = website.split('/')[0]
    website = website.split('?')[0]
    website = website.split('#')[0]
    website = website.split('#!')[0]
    if (website.split(':').length <= 1) {
        return '80'
    }
    website = website.split(':')[1]
    return website
}

export function getUa(): string {
    if (navigator.userAgent.indexOf('Firefox') >= 0) {
        return 'firefox'
    } else if (navigator.userAgent.indexOf('Opera') >= 0) {
        return 'opera'
    } else if (navigator.userAgent.indexOf('Edge') >= 0) {
        return 'edge'
    } else {
        return 'chrome'
    }
}

export function getRawUa(): string {
    return navigator.userAgent
}

export function getVersion(): string {
    return chrome.runtime.getManifest().version
}

export function language(): string {
    if (navigator.language) {
        return navigator.language
    } else {
        return navigator.browserLanguage
    }
}

/* tslint:disable:no-bitwise */
function s4(): string {
   return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}
/* tslint:enable:no-bitwise */

function guid(): string {
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`
}

function getViewportSize() {
    const width = window.innerWidth || document.documentElement.clientWidth
    const height = window.innerHeight || document.documentElement.clientHeight
    return `${width}x${height}`
}

export async function sendGA(eventName: string) {
    const config = await coreConfig.get()
    if (!config.dataCollection) {
        return
    }
    let cid = await store.get('cid')
    if (cid == null) {
        cid = guid()
        store.set('cid', cid)
    }
    api.statistics({
        v: '1',
        tid: 'UA-101903685-1',
        cid,
        aip: '1',
        ds: 'add-on',
        t: 'event',
        ec: 'Browser extensions',
        ea: eventName,
        el: getVersion(),
        an: 'Browser extensions',
        av: getVersion(),
        ul: language(),
        sd: '24-bit',
        sr: getViewportSize(),
        vp: '0x0',
    })
}

export function serializeMapNumNum(map: Map<number, number>): string {
    let recordStrings = new Array<string>()
    map.forEach((v, k) => recordStrings.push(`${k}:${v}`))
    return recordStrings.join(',')
}

export function deserializeMapNumNum(recordString: string): Map<number, number> {
    const records = new Map<number, number>()
    if (!recordString) {
        return records
    }
    recordString.split(',').map((kvStr: string) => {
        let [k, v] = kvStr.split(':').map((n) => parseInt(n))
        if (isNaN(v)) {
            v = 0
        }
        records.set(k, v)
    })
    return records
}

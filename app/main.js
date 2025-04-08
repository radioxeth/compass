// global variables
let isPointerFixed = false
let isTesting = false
let time = Date.now()

const getTime = (date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

const getRandomBetween0And360 = () => Math.floor(Math.random() * 360)
const getRandomBetween0and90 = () => Math.floor(Math.random() * 90)

let currentCoords = {
    latitude: null,
    longitude: null,
    heading: null,
}

let startCoords = {
    latitude: 0,
    longitude: 0,
    heading: 0,
}

let startHeading = 0

const clock = () => {
    document.getElementById('time').innerHTML = getTime(new Date())
    window.setInterval(() => {
        document.getElementById('time').innerHTML = getTime(new Date())
    }, 1000)
}

const userPreferences = () => {
    const themeCheckbox = document.getElementById('theme-checkbox')
    // Load the saved theme preference, if any
    const currentTheme = localStorage.getItem('theme') ?? null
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme)
        // If the current theme is dark, check the checkbox
        if (currentTheme === 'dark') {
            themeCheckbox.checked = true
        }
    }
    // Listen for changes on the checkbox to toggle between themes
    themeCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.setAttribute('data-theme', 'light')
            localStorage.setItem('theme', 'light')
        }
    })

    const pointerCheckbox = document.getElementById('pointer-checkbox')
    // load the saved pointer preferences, if any
    const currentPointer = localStorage.getItem('pointer-fixed') ?? null
    if (currentPointer) {
        // If the current pointer is true, set to true
        const isCurrentPointerFixed = currentPointer === 'true' ? true : false
        pointerCheckbox.checked = isCurrentPointerFixed
        isPointerFixed = isCurrentPointerFixed
    }

    // Listen for changes on the checkbox to toggle between themes
    pointerCheckbox.addEventListener('change', (e) => {
        isPointerFixed = e.target.checked
        localStorage.setItem('pointer-fixed', isPointerFixed)
    })
}

const setCoords = (coords) => {
    document.getElementById('latitude').innerHTML = coords?.latitude ?? '--'
    document.getElementById('longitude').innerHTML = coords?.longitude ?? '--'
    document.getElementById('speed').innerHTML = `${speedMPH(coords?.speed)} mph`
    currentCoords = {
        ...currentCoords,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        heading: coords?.heading ?? null,
    }

}

const speedMPH = (speedMPS) => {
    if (speedMPS === null || typeof speedMPS === 'undefined') {
        return '--'
    }
    return `${Math.round(speedMPS * 2.236936)}`
}

const degreeToCardinal = (deg) => {
    let direction = '--'
    if (deg === null || typeof deg === 'undefined') {
        return direction
    }
    if ((deg >= 337.5 && deg <= 360) || (deg >= 0 && deg < 22.5)) {
        direction = 'N'
    } else if (deg >= 22.5 && deg < 67.5) {
        direction = 'NE'
    } else if (deg >= 67.5 && deg < 112.5) {
        direction = 'E'
    } else if (deg >= 112.5 && deg < 157.5) {
        direction = 'SE'
    } else if (deg >= 157.5 && deg < 202.5) {
        direction = 'S'
    } else if (deg >= 202.5 && deg < 247.5) {
        direction = 'SW'
    } else if (deg >= 247.5 && deg < 292.5) {
        direction = 'W'
    } else if (deg >= 292.5 && deg < 337.5) {
        direction = 'NW'
    }
    return direction
}

const setCompassHeading = (heading, currentHeading) => {
    const transitionStyle = `transform ${(Date.now() - time) / 1000}s`

    const borderSign = isPointerFixed ? -1 : 0
    const pointerSign = isPointerFixed ? 1 : 1

    const compassBorderElement = document.getElementById('compass-border')
    const compassPointerElement = document.getElementById('compass-pointer')

    compassBorderElement.style.transition = transitionStyle
    compassPointerElement.style.transition = transitionStyle

    currentHeading = getShortestRotation(currentHeading, heading)

    compassBorderElement.style.transform = `rotate(${borderSign * currentHeading}deg)`
    compassPointerElement.style.transform = `rotate(${pointerSign * currentHeading}deg)`
    time = Date.now()
    return currentHeading
}

const getShortestRotation = (currentHeading, targetHeading) => {
    if (!currentHeading) currentHeading = 0
    if (!targetHeading) targetHeading = 0

    const negativeHeading = targetHeading - 360
    if (Math.abs(currentHeading) === 0 || Math.abs(negativeHeading) === 360) {
        return Math.abs(targetHeading) < Math.abs(negativeHeading) ? targetHeading : negativeHeading
    } else {
        const diffPlus = targetHeading - currentHeading
        const diffNeg = negativeHeading - currentHeading
        return Math.abs(diffPlus) < Math.abs(diffNeg) ? targetHeading : negativeHeading
    }
}

const setCompassBearing = (heading) => {
    const headingElement = document.getElementById('compass-bearing')
    if (heading === null || typeof heading === 'undefined') {
        headingElement.innerHTML = '--'
        return
    }
    headingElement.innerHTML = `${Math.round(heading * 10) / 10}&deg ${degreeToCardinal(heading)}`
}

const getCurrentPositionForTesting = () => {
    let currentHeading = 90
    setInterval(() => {
        let heading = currentHeading
        startCoords.latitude += 0
        startCoords.longitude += .1
        const lat = startCoords.latitude
        const lon = startCoords.longitude

        const speed = 100
        const tempPosition = {
            timestamp: Date.now(),
            coords: {
                latitude: lat,
                longitude: lon,
                altitude: 0,
                accuracy: 1,
                altitudeAccuracy: 1,
                heading: heading,  // Overwrite the heading
                speed: speed, // Overwrite the speed
            }
        }
        if (speedMPH(tempPosition.coords?.speed) > 0) {
            currentHeading = setCompassHeading(tempPosition.coords?.heading, currentHeading)
            setCompassBearing(tempPosition.coords?.heading)
        }
        setCoords(tempPosition.coords)
        setPins(tempPosition)
    }, 3000)
}

const getCurrentPosition = () => {
    let currentHeading = 0
    navigator.geolocation.watchPosition((position) => {
        if (speedMPH(position.coords?.speed) > 0) {
            currentHeading = setCompassHeading(position.coords?.heading, currentHeading)
            setCompassBearing(position.coords?.heading)
        }
        setCoords(position.coords)
        setPins(position)
    }, (error) => {
        // Error callback
        setCoords(null)
        setCompassHeading(null, null)
        setCompassBearing(null)
        console.error('Error obtaining location: ', error)
    }, { enableHighAccuracy: true })
}

const watchPosition = () => {
    // Check if Geolocation API is supported by the browser
    if ('geolocation' in navigator) {
        // Request the current location
        if (isTesting) {
            getCurrentPositionForTesting()
        } else {
            getCurrentPosition()
        }
    } else {
        setCoords(null)
        setCompassHeading(null, null)
        setCompassBearing(null)
        console.error('Geolocation API not supported by this browser.')
    }
    setPins()
}

const setTicks = () => {
    const compassBorderElement = document.getElementById('compass-border')
    const compassBorderRadius = compassBorderElement.offsetWidth / 2
    let degrees = 0
    while (degrees < 360) {
        const tickElement = document.createElement('div')
        if (![0, 90, 180, 270].includes(degrees)) {
            const tickSize = degrees % 2 === 0 ? 10 : 5
            tickElement.setAttribute('class', `minor-tick-${tickSize}`)
        } else if (degrees === 270) {
            tickElement.setAttribute('class', `major-tick-15-N`)
            const cardinal = document.createElement('div')
            cardinal.setAttribute('class', 'n')
            cardinal.innerHTML = 'N'
            tickElement.appendChild(cardinal)
        } else if (degrees === 0) {
            tickElement.setAttribute('class', `major-tick-15`)
            const cardinal = document.createElement('div')
            cardinal.setAttribute('class', 'e')
            cardinal.innerHTML = 'E'
            tickElement.appendChild(cardinal)
        } else if (degrees === 90) {
            tickElement.setAttribute('class', `major-tick-15`)
            const cardinal = document.createElement('div')
            cardinal.setAttribute('class', 's')
            cardinal.innerHTML = 'S'
            tickElement.appendChild(cardinal)
        } else if (degrees === 180) {
            tickElement.setAttribute('class', `major-tick-15`)
            const cardinal = document.createElement('div')
            cardinal.setAttribute('class', 'w')
            cardinal.innerHTML = 'W'
            tickElement.appendChild(cardinal)
        }
        const radians = degrees * (Math.PI / 180)
        const x = (compassBorderRadius - 15) * Math.cos(radians)
        const y = (compassBorderRadius - 15) * Math.sin(radians)
        tickElement.style.transform = `translate(${x}px, ${y}px) rotate(${degrees}deg)`
        tickElement.setAttribute('id', `tick-${degrees}`)

        compassBorderElement.appendChild(tickElement)
        degrees += 5
    }
    window.onresize = resizeTicks
}

const toRadians = (degrees) => {
    return degrees * (Math.PI / 180)
}

const toDegrees = (radians) => {
    return radians * (180 / Math.PI)
}

const calculateRelativeBearing = (lat, lon, latPrime, lonPrime, headingDeg) => {
    // Convert degrees to radians
    const phi1 = toRadians(lat)
    const phi2 = toRadians(latPrime)
    const deltaLambda = toRadians(lonPrime - lon)

    // Calculate initial bearing
    const x = Math.sin(deltaLambda) * Math.cos(phi2)
    const y = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda)
    const initialBearing = Math.atan2(x, y)

    // Convert to degrees and normalize to [0, 360)
    const initialBearingDeg = (toDegrees(initialBearing) + 360) % 360

    // Calculate relative bearing
    const relativeBearing = (initialBearingDeg - headingDeg + 360) % 360

    return relativeBearing
}

const setPins = (position) => {
    const compassBorderElement = document.getElementById('compass-border')
    const compassBorderRadius = compassBorderElement.offsetWidth / 2
    const pins = JSON.parse(localStorage.getItem('pins')) || []
    // remove all pins
    const pinElements = document.querySelectorAll('.pin')
    pinElements.forEach((pinElement) => {
        pinElement.remove()
    })
    if (!position) {
        return
    }
    // add all pins
    pins.forEach((pin, index) => {
        const pinElement = document.createElement('div')
        pinElement.setAttribute('class', 'pin')
        pinElement.setAttribute('id', `pin-${index}`)
        // add label
        const labelElement = document.createElement('div')
        labelElement.setAttribute('class', 'pin-label')
        labelElement.innerHTML = `${index + 1}`
        pinElement.appendChild(labelElement)

        const relativePinBearing = calculateRelativeBearing(
            position.coords.latitude,
            position.coords.longitude,
            pin.latitude,
            pin.longitude,
            position.coords.heading
        )

        // Calculate x and y coordinates
        const x = (compassBorderRadius + 15) * Math.cos(toRadians(relativePinBearing))
        const y = (compassBorderRadius + 15) * Math.sin(toRadians(relativePinBearing))

        // Set the rotation of the pin
        pinElement.style.transform = `translate(${x}px, ${y}px)`
        compassBorderElement.appendChild(pinElement)
    })
}

const resizeTicks = () => {
    let degrees = 0
    const compassBorderElement = document.getElementById('compass-border')
    const compassBorderRadius = compassBorderElement.offsetWidth / 2
    while (degrees < 360) {
        const tickElement = document.getElementById(`tick-${degrees}`)
        const radians = degrees * (Math.PI / 180)
        const x = (compassBorderRadius - 15) * Math.cos(radians)
        const y = (compassBorderRadius - 15) * Math.sin(radians)
        tickElement.style.transform = `translate(${x}px, ${y}px) rotate(${degrees}deg)`
        degrees += 5
    }
}

const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
        try {
            const registration = await navigator.serviceWorker.register("/serviceWorker.js", {
                scope: "/",
            })
            if (registration.installing) {
                console.log("Service worker installing")
            } else if (registration.waiting) {
                console.log("Service worker installed")
            } else if (registration.active) {
                console.log("Service worker active")
            }
        } catch (error) {
            console.error(`Registration failed with ${error}`)
        }
    }
}

const copy = () => {
    const latitude = document.getElementById('latitude').innerText
    const longitude = document.getElementById('longitude').innerText

    const text = `${latitude.trim()}, ${longitude.trim()}`
    navigator.clipboard.writeText(text)

    //fade out and fade in
    const copyButton = document.getElementById('copy')
    copyButton.style.opacity = 0
    copyButton.style.transition = 'opacity 0.5s'
    setTimeout(() => {
        copyButton.style.opacity = 1
    }, 500)
}

const copyListener = () => {
    const copyButton = document.getElementById('copy')
    copyButton.addEventListener('click', () => { copy() })
}

const dropPinListener = () => {
    // long press on the compass drops a pin in local storage that appear as a marker on the edge of the compass
    const compassBorder = document.getElementById('compass-border')
    // long press on the compassBorder event
    let timer = null
    compassBorder.addEventListener('mousedown', (e) => {
        timer = setTimeout(() => {
            console.log('long press')
            console.log('currentCoords', currentCoords)
            // add pin to local storage
            const pins = JSON.parse(localStorage.getItem('pins')) || []
            const pin = {
                latitude: currentCoords.latitude,
                longitude: currentCoords.longitude,
                timestamp: Date.now(),
            }
            pins.push(pin)
            localStorage.setItem('pins', JSON.stringify(pins))

            compassBorder.style.opacity = 0.25
            compassBorder.style.transition = 'opacity 1s'
            setTimeout(() => {
                compassBorder.style.opacity = 1
            }, 1000)
        }, 1000)
    })
    compassBorder.addEventListener('mouseup', () => {
        clearTimeout(timer)
    })


    // touch screen
    let longPressTimer = null
    compassBorder.addEventListener('touchstart', (e) => {
        e.preventDefault() // Prevent default touch behavior
        longPressTimer = setTimeout(() => {
            console.log('long press')
            console.log('currentCoords', currentCoords)
            // add pin to local storage
            const pins = JSON.parse(localStorage.getItem('pins')) || []
            const pin = {
                latitude: currentCoords.latitude,
                longitude: currentCoords.longitude,
                timestamp: Date.now(),
            }
            pins.push(pin)
            localStorage.setItem('pins', JSON.stringify(pins))

            compassBorder.style.opacity = .25
            compassBorder.style.transition = 'opacity 0.5s'
            setTimeout(() => {
                compassBorder.style.opacity = 1
            }, 500)
        }, 1000)
    })

    compassBorder.addEventListener('touchend', () => {
        clearTimeout(longPressTimer)
    })

    compassBorder.addEventListener('touchcancel', () => {
        clearTimeout(longPressTimer)
    })
}

const main = () => {
    userPreferences()
    setCompassHeading(null)
    setCompassBearing(null)
    setCoords(null)
    clock()
    watchPosition()
    setTicks()
    registerServiceWorker()
    copyListener()
    dropPinListener()
}

main()

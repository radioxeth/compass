let isPointerFixed = false
let isTesting = true
const getTime = (date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

const getRandomBetween0And360 = () => Math.floor(Math.random() * 361)

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
    // Listen for changes on the checkbox to toggle between themes
    pointerCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            localStorage.setItem('pointer-fixed', true)
            isPointerFixed = true
        } else {
            localStorage.setItem('pointer-fixed', false)
            isPointerFixed = false
        }
    })
}

const setStats = (coords) => {
    document.getElementById('latitude').innerHTML = coords?.latitude ?? '--'
    document.getElementById('longitude').innerHTML = coords?.longitude ?? '--'
    document.getElementById('speed').innerHTML = `${speed(coords?.speed)} mph`
    document.getElementById('heading').innerHTML = degreeToCardinal(coords?.heading)
}

const speed = (speedMPS) => {
    if (speedMPS) {
        return `${Math.round(speedMPS * 2.236936)}`
    } else {
        return '--'
    }
}

const degreeToCardinal = (deg) => {
    let direction = '--'
    if (deg === null) {
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

let time = Date.now()
const setCompass = (heading) => {
    const transitionStyle = `transform ${(Date.now() - time) / 1000}s`

    const borderSign = isPointerFixed ? -1 : 0
    const compassBorderElement = document.getElementById('compass-border')
    compassBorderElement.style.transition = transitionStyle
    compassBorderElement.style.transform = `rotate(${borderSign * heading}deg)`;

    const pointerSign = isPointerFixed ? 1 : 1
    const compassPointerElement = document.getElementById('compass-pointer')
    compassPointerElement.style.transition = transitionStyle
    compassPointerElement.style.transform = `rotate(${pointerSign * heading}deg)`;
    time = Date.now()
}

const setCompassBearing = (heading) => {
    const headingElement = document.getElementById('compass-bearing-top')
    headingElement.innerHTML = `${Math.round(heading * 10) / 10}&deg; ${degreeToCardinal(heading)}`
}

const watchPosition = () => {
    // Check if Geolocation API is supported by the browser
    if ('geolocation' in navigator) {
        // Request the current location
        if (isTesting) {
            setInterval(() => {
                navigator.geolocation.getCurrentPosition((position) => {
                    let heading = getRandomBetween0And360()
                    const tempPosition = {
                        timestamp: position.timestamp,
                        coords: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            altitude: position.coords.altitude,
                            accuracy: position.coords.accuracy,
                            altitudeAccuracy: position.coords.altitudeAccuracy,
                            heading: heading,  // Overwrite the heading
                            speed: position.coords.speed
                        }
                    }
                    setStats(tempPosition.coords)
                    setCompass(tempPosition.coords?.heading)
                    setCompassBearing(tempPosition.coords?.heading)
                    currentHeading = heading
                }, (error) => {
                    // Error callback
                    setStats(null)
                    setCompass(null)
                    setCompassBearing(null)
                    console.error('Error obtaining location: ', error)
                }, { enableHighAccuracy: true })
            }, 3000);
        } else {
            navigator.geolocation.watchPosition((position) => {
                setStats(position.coords)
                setCompass(position.coords?.heading)
                setCompassBearing(position.coords?.heading)
            }, (error) => {
                // Error callback
                setStats(null)
                setCompass(null)
                setCompassBearing(null)
                console.error('Error obtaining location: ', error)
            }, { enableHighAccuracy: true })
        }


    } else {
        setStats(null)
        setCompass(null)
        setCompassBearing(null)
        console.error('Geolocation API not supported by this browser.')
    }
}

const minorTicks = () => {
    const compassBorderElement = document.getElementById('compass-border')
    const compassBorderRadius = compassBorderElement.offsetWidth / 2
    let degrees = 0
    while (degrees < 360) {
        if (![0, 90, 180, 270].includes(degrees)) {
            const tickSize = degrees % 2 === 0 ? 10 : 5
            const tick = document.createElement('div')
            tick.setAttribute('class', `minor-tick-${tickSize}`)
            tick.setAttribute('id', `tick-${degrees}`)
            // tick.innerText = degrees
            const radians = degrees * (Math.PI / 180)
            const x = (compassBorderRadius - 15) * Math.cos(radians)
            const y = (compassBorderRadius - 15) * Math.sin(radians)
            tick.style.transform = `translate(${x}px, ${y}px) rotate(${degrees}deg)`
            // tick.style.transform = `rotate(${degrees}deg)`
            compassBorderElement.appendChild(tick)
        }
        degrees += 5
    }
}

const main = () => {
    setCompass(null)
    setCompassBearing(null)
    setStats(null)
    clock()
    userPreferences()
    watchPosition()
    minorTicks()
}

main()

// current position = 0

// first heading is 90
// rotate 90 from 0(heading - current)
// current position is 90

// second heading is 30
// rotate - 60 from 90(heading - current)
// current position is 30

// third heading is 45
// rotate 15 from 30
// current position is 45


// currentPosition - heading = rotate
const getTime = (date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

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
    if (!deg) {
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

const startTimer = () => {

}

const setCompass = (heading) => {


    const compassPointerElement = document.getElementById('compass-pointer')
    compassPointerElement.style.transition = `transform ${Date.now() - time}`
    compassPointerElement.style.transform = `rotate(${heading - 90}deg)`
    time = Date.now()
    if (heading) {
        compassPointerElement.style.display = 'block'
    } else {
        compassPointerElement.style.display = 'none'
    }
}

const watchPosition = () => {
    // Check if Geolocation API is supported by the browser
    if ('geolocation' in navigator) {
        // Request the current location
        navigator.geolocation.watchPosition((position) => {
            setStats(position.coords)
            setCompass(position.coords?.heading)
        }, (error) => {
            // Error callback
            setStats(null)
            setCompass(null)
            console.error('Error obtaining location: ', error)
        }, { enableHighAccuracy: true })
    } else {
        setStats(null)
        setCompass(null)
        console.error('Geolocation API not supported by this browser.')
    }
}



const main = () => {
    clock()
    userPreferences()
    watchPosition()
}

main()
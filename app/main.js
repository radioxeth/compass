const main = () => {
    navigate()
    userPreferences()
    clock()
}

const clock = () => {
    document.getElementById('time').innerHTML = new Date().toLocaleTimeString()
    window.setInterval(() => {
        document.getElementById('time').innerHTML = new Date().toLocaleTimeString()
    }, 1000)
}

const setCoords = (coords) => {
    document.getElementById('latitude').innerHTML = coords?.latitude ?? '--'
    document.getElementById('longitude').innerHTML = coords?.longitude ?? '--'
    document.getElementById('speed').innerHTML = `${speed(coords?.speed)} mph`
    document.getElementById('heading').innerHTML = degreeToCardinal(coords?.heading)
}

const speed = (speedMPS) => {
    if (speedMPS) {
        return `${Math.round(coords?.speed * 2.236936)}`
    } else {
        return '--'
    }
}

const degreeToCardinal = (deg) => {
    let direction = '--';
    if (!deg) {
        return direction
    }
    if ((deg >= 337.5 && deg <= 360) || (deg >= 0 && deg < 22.5)) {
        direction = 'N';
    } else if (deg >= 22.5 && deg < 67.5) {
        direction = 'NE';
    } else if (deg >= 67.5 && deg < 112.5) {
        direction = 'E';
    } else if (deg >= 112.5 && deg < 157.5) {
        direction = 'SE';
    } else if (deg >= 157.5 && deg < 202.5) {
        direction = 'S';
    } else if (deg >= 202.5 && deg < 247.5) {
        direction = 'SW';
    } else if (deg >= 247.5 && deg < 292.5) {
        direction = 'W';
    } else if (deg >= 292.5 && deg < 337.5) {
        direction = 'NW';
    }

    return direction;
}


const styleCompass = (heading) => {
    const compassPointerElement = document.getElementById('compass-pointer')
    const compassBorderElement = document.getElementById('compass-border')
    if (heading) {
        compassPointerElement.style.display = 'block'
        compassPointerElement.style.transform = `rotate(${heading - 90}deg)`
        compassBorderElement.innerHTML = degreeToCardinal(heading)
    } else {
        compassPointerElement.style.display = 'none'
        compassBorderElement.innerHTML = '--'
    }
}

const watchPosition = () => {
    // Check if Geolocation API is supported by the browser
    if ('geolocation' in navigator) {
        // Request the current location
        navigator.geolocation.watchPosition((position) => {
            setCoords(position.coords)
            styleCompass(position.coords.heading)
        }, (error) => {
            // Error callback
            setCoords(null)
            styleCompass(null)
            console.error('Error obtaining location: ', error)
        }, { enableHighAccuracy: true })
    } else {
        setCoords(null)
        console.error('Geolocation API not supported by this browser.')
    }
}

const navigate = () => {
    watchPosition()
}

const userPreferences = () => {
    const themeCheckbox = document.getElementById('checkbox');

    // Load the saved theme preference, if any
    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        // If the current theme is dark, check the checkbox
        if (currentTheme === 'dark') {
            themeCheckbox.checked = true;
        }
    }

    // Listen for changes on the checkbox to toggle between themes
    themeCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
}

main()
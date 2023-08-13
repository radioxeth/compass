const main = () => {
    console.log('main')
    navigate()
}

const setCoords = (coords) => {
    document.getElementById('latitude').innerHTML = coords?.latitude ?? 'xx.xxxx'
    document.getElementById('longitude').innerHTML = coords?.longitude ?? 'xx.xxxx'
    document.getElementById('speed').innerHTML = coords?.speed ?? 'xx.xxxx'
    document.getElementById('heading').innerHTML = coords?.heading ?? 'xx.xxxx'
    document.getElementById('speed').innerHTML = 10
    document.getElementById('heading').innerHTML = 90
}

const styleCompass = (heading) => {
    const compassPointerElement = document.getElementById('compass-pointer')
    if (heading) {
        compassPointerElement.style.display = 'block'
        compassPointerElement.style.transform = `rotate(${heading - 90}deg)`
    } else {
        compassPointerElement.style.display = 'none'
    }
}

const watchPosition = () => {
    // Check if Geolocation API is supported by the browser
    if ("geolocation" in navigator) {
        // Request the current location
        navigator.geolocation.watchPosition((position) => {
            console.log(position)
            setCoords(position.coords)
            styleCompass(position.coords.heading)
        }, (error) => {
            // Error callback
            setCoords(null)
            styleCompass(null)
            console.error("Error obtaining location: ", error)
        }, { enableHighAccuracy: true })
    } else {
        setCoords(null)
        console.error("Geolocation API not supported by this browser.")
    }
}

const navigate = () => {
    // window.setInterval(() => {
    //     getCurrentPosition()
    // }, 1000)
    watchPosition()
}

main()
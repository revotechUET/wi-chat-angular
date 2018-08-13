const componentName = 'imgPreview';
const moduleName = 'img-preview';
require('../img-preview/img-preview.css');

function Controller() {
    let self = this;
    // let modalImg, modal;  //tag

    self.$onInit = function () {


        // console.log('inside');
        // const modal = $element.find('modal');
        // const img = $element.find('.main-img');
        // const modalImg = $element.find('.modal-content');


        // console.log(self.source);
        // // console.log('img-preview');
        // console.log({modal});
        // console.log({img});
        // console.log({modalImg});
        preProcess();
        // enableZoom(self.zoomRate);
        
        
    }

    self.imgOnclick = function () {

        const modal = document.getElementById(self._modal);
        // const modalImg = document.getElementById(self._modalImg);

        modal.style.display = "block";
        // modalImg.src = self.source;


        //create zoomer
        if(!self.zoomer) self.zoomer = creatZoomer();
        
    }

    self.closeOnClick = function () {
        const modal = document.getElementById(self._modal);

        modal.style.display = 'none';
        // console.log('img click');
        // console.log({modal});
    }

    self.zoomByMouseToggle = function () {
        console.log({'self.zoomer.isZoomHoverEnable':self.zoomer.isZoomHoverEnable()});
        if (!self.zoomer.isZoomHoverEnable()) {
            //zoom hover
            self.zoomer.enableZoom();
        } else {
            self.zoomer.disableZoom();
        }
    }    

    // self.zoomIn = function () {
    //     self.zoomer.zoomIn();
    // }
    // self.zoomOut = function () {
    //     self.zoomer.zoomOut()
    // }

    // self.creatZoomer = function() {
    //     if(!self.zoomer) self.zoomer = creatZoomer();
    // }

    // self.downloadOnClick = function () {
    //     // self.downloadFunc(self.source);
    //     // console.log('download');

    //     // const a = document.createElement('a');
    //     // a.download = true;
    //     // a.href = self.source;

    //     // a.onclick = function(e) {
    //     //     e.preventDefault();
    //     // }

    //     // a.click();

    //     console.log(self.downloadFunc());
    // }


    function preProcess() {
        self._modal = genUniqueId('modal');
        // self._img = genUniqueId('img');
        self._modalImg = genUniqueId('modal-img');
        self._zoomBackground = genUniqueId('zoom-background');
        // self._zoomInnerImage = genUniqueId('zoom-inner-image');
        // self._closeBtn = genUniqueId('close-btn');

        // img = document.getElementById(self._img);


        // console.log(modal);
        // console.log(modalImg);
        // closeBtn = document.getElementById(self._closeBtn);

        // self.zoomRate = 100;
        // self.zoomer = creatZoomer();
    }

    function genUniqueId(name, src = self.smallImgLink) {
        const now = Date.now().toString();

        return `__${now}-${src}-${name}__`;
    }

    // function enableZoom() {
    //     document.querySelector('figure.zoom').onmousemove = function(e) {
    //         const zoomer = e.currentTarget;
    //         let offsetX, offsetY, x, y;

    //         //just change the position of the center of zooming
    //         //the background-size default is 100%
    //         //the img-size if 90% //css-file
    //         //so default is img hide => zoom => change coord of center => zoom custom
    //         zoomer.style.backgroundImage = `url('${self.fullImgLink}')`;
    //         e.offsetX ? offsetX = e.offsetX : offsetX = e.touches[0].pageX
    //         e.offsetY ? offsetY = e.offsetY : offsetX = e.touches[0].pageX
    //         x = offsetX / zoomer.offsetWidth * 100
    //         y = offsetY / zoomer.offsetHeight * 100 
    //         zoomer.style.backgroundPosition = x + '% ' + y + '%';
    //     }
    // }

    function creatZoomer() {

        // const background = document.querySelector('figure.zoom');
        // const insideImg = document.querySelector('figure.zoom img');

        const background = document.getElementById(self._zoomBackground);
        const insideImg = document.getElementById(self._modalImg);

        const INSIDE_IMG_SIZE = 90;  //90%
        let zoomRate = 1;

        background.style.backgroundImage = `url('${self.fullImgLink}')`;
        console.log({'self.fullIMGLinkd': self.fullImgLink});
        function enableZoom() {
            background.onmousemove = function (e) {
                const zoomer = e.currentTarget;
                let offsetX, offsetY, x, y;


                //make inside img invisible
                // insideImg.style.opacity = 0;
                invisibleImgInside();

                //just change the position of the center of zooming
                //the background-size default is 100%
                //the img-size if 90% //css-file
                //so default is img hide => zoom => change coord of center => zoom custom
                // zoomer.style.backgroundImage = `url('${self.fullImgLink}')`;
                e.offsetX ? offsetX = e.offsetX : offsetX = e.touches[0].pageX
                e.offsetY ? offsetY = e.offsetY : offsetX = e.touches[0].pageX
                x = offsetX / zoomer.offsetWidth * 100
                y = offsetY / zoomer.offsetHeight * 100
                zoomer.style.backgroundPosition = x + '% ' + y + '%';
            }

            background.onmouseout = function(e) {
                insideImg.style.opacity = 1;
            }
        }

        function disableZoom() {
            insideImg.style.opacity = 1;
            disableZoomHover();
        }

        function zoomIn() {
            invisibleImgInside();
            if (zoomRate <= 9)++zoomRate;
            const ZOOM_SIZE = zoomRate + INSIDE_IMG_SIZE;

            // if(ZOOM_SIZE >= 100) ZOOM_SIZE = 100;
            background.style.backgroundSize = ZOOM_SIZE;

            disableZoomHover();
        }

        function zoomOut() {
            invisibleImgInside();
            if (zoomRate >= 1)--zoomRate;
            const ZOOM_SIZE = zoomRate + INSIDE_IMG_SIZE;

            // if(ZOOM_SIZE <= INSIDE_IMG_SIZE) ZOOM_SIZE = INSIDE_IMG_SIZE;
            background.style.backgroundSize = ZOOM_SIZE;

            disableZoomHover();
        }

        function disableZoomHover() {
            background.onmousemove = null;
            background.onmouseout = null;
        }

        function isZoomHoverEnable() {
            // return (typeof background.onmousemove === 'function');

            return !!(background.onmousemove);
        }

        function invisibleImgInside() {
            insideImg.style.opacity = 0;
        }

        return {
            enableZoom,
            disableZoom,
            zoomIn,
            zoomOut,
            isZoomHoverEnable
        }
    }
}


let app = angular.module(moduleName, []);
app.component(componentName, {
    template: require('../img-preview/img-preview.html'),
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        smallImgLink: '<',
        downloadLink: '<',
        fullImgLink: '<'
    }
});

exports.name = moduleName;
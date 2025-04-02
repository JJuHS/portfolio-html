const canvas = document.querySelector("canvas");
// 언어 설정
let lang = 'ko'
const langKoBtn = document.getElementById("lang-ko")
const langEnBtn = document.getElementById("lang-en")
const textInputBtn = document.getElementById("text")
const paintTitleTxt = document.getElementById("paint-title")
function changeLanguage(newlang) {
    lang = newlang
    document.querySelectorAll("[data-en]").forEach(el => {
        el.innerText = el.dataset[lang];
    });
    if (lang == "ko") {
        textInputBtn.placeholder = "텍스트 입력";
        textInputBtn.title = "텍스트 입력";
        paintTitleTxt.innerHTML = '<p>그 림 판</p>';
        modeBtn.innerText = isFilling ? "채우기" : "그리기";
    } else {
        textInputBtn.placeholder = "Write Text Here";
        textInputBtn.title = "Double Click";
        paintTitleTxt.innerHTML = '<p>Paint</p>';
        modeBtn.innerText = isFilling ? "Fill" : "Paint";
    }
}
langKoBtn.addEventListener("click", () => changeLanguage("ko"));
langEnBtn.addEventListener("click", () => changeLanguage("en"));

// brush
const ctx = canvas.getContext("2d");

// board size
canvas.width = 800;
canvas.height = 800;

// 선 그리기
let isPaint = false;
function onMove (event) {
    const {x, y} = getMousePos(event);

    if (isPaint) { 
        ctx.lineTo(x, y); 
        ctx.stroke(); 
        return;
    }
    ctx.beginPath();
    ctx.moveTo(x, y); 
}

function onMouseDown(event) {
    isPaint = true; 
}
function cancelPainting() {
    isPaint = false;
}
canvas.addEventListener("mousemove", onMove); 
canvas.addEventListener("mousedown", onMouseDown); 
canvas.addEventListener("mouseup", cancelPainting); 
canvas.addEventListener("mouseleave", cancelPainting); 

// 선 굵기 설정
const lineWidth = document.getElementById("line-width"); 
const lineWidthDisplay = document.getElementById("line-width-display");
ctx.lineWidth = lineWidth.value; 
function onLineWidthChange(event) {
    ctx.lineWidth = event.target.value; 
    lineWidthDisplay.innerText = `${event.target.value} px`;
}
lineWidth.addEventListener("change", onLineWidthChange); 

// 색 설정
const color = document.getElementById("color"); 
const colorOptions = Array.from(document.getElementsByClassName("color-option")); 

function onColorChange(event) {
    ctx.strokeStyle = event.target.value; 
    ctx.fillStyle = event.target.value; 
}
color.addEventListener("change", onColorChange);

function onColorClick(event) {
    color.value = event.target.dataset.color; 
    ctx.strokeStyle = event.target.dataset.color; 
    ctx.fillStyle = event.target.dataset.color; 
}
colorOptions.forEach(color => {
    color.addEventListener("click", onColorClick); 
});

// 모드 변경 (채우기 / 그리기)
const modeBtn = document.getElementById("mode-btn"); 
let isFilling= false; 
function onModeClick(event) {
    if (isFilling) {
        modeBtn.innerText = lang === "ko" ? "그리기" : "Paint";
    } else {
        modeBtn.innerText = lang === "ko" ? "채우기" : "Fill";
    }
    isFilling = !isFilling
}
modeBtn.addEventListener("click", onModeClick);
function onCanvasClick(event) {
    if (isFilling) {
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
}
canvas.addEventListener("click", onCanvasClick); 

// 전체 지우기, 지우개
const destroyBtn = document.getElementById("destroy-btn");
const eraserBtn = document.getElementById("eraser-btn");
let eraserMode = false;
let blinkInterval;

function onDestroyClick(event) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function onEraserClick(event) {
    eraserMode = !eraserMode;
    console.log(eraserMode);
    let beforeColor;
    if (eraserMode) {
        beforeColor = ctx.strokeStyle;
        eraserBtn.style.backgroundColor = "#274da1";
        ctx.strokeStyle = "white";
        
        // 깜빡임 반복 함수
        function blink() {
            const currentColor = eraserBtn.style.backgroundColor;
            const targetColor = "rgb(39, 77, 161)"; 

            if (currentColor === targetColor) {
                eraserBtn.style.backgroundColor = "rgb(71, 119, 222)";
            } else {
                eraserBtn.style.backgroundColor = targetColor;
            }
        }
        
        // 1초 동안 두 번 깜빡임 후 3초 쉬고 반복
        function startBlinking() {
            blink();
            setTimeout(() => {
                if (eraserMode) {
                    startBlinking(); // 3초 후 반복
                }
            }, 1000); // 3초 쉬고 다시 시작
        }
        startBlinking(); // 초기 깜빡임 시작
    } else {
        ctx.strokeStyle = beforeColor;
        eraserBtn.style.backgroundColor = "";
    }
}
destroyBtn.addEventListener("click", onDestroyClick);
eraserBtn.addEventListener("click", onEraserClick);

// 이미지 넣기
const fileInput = document.getElementById("file");

function onFileChange(event) {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file)
    const image = new Image();
    image.src = url;

    image.onload = () => {
        ctx.drawImage(image, canvas.width, canvas.height); // x, y, width, height
        fileInput.value = null;
    }
}
fileInput.addEventListener("change", onFileChange);

// 텍스트 넣기
const textInput = document.getElementById("text");

function onDoubleClick(event) {
    if (!!textInput) {
        ctx.save();
        const text = textInput.value;
        ctx.lineWidth = 1;
        ctx.font = "48px sans-serif";
        ctx.strokeText(text, event.offsetX, event.offsetY);
        ctx.restore();
    }
}

canvas.addEventListener("dblclick", onDoubleClick);

// 이미지로 저장
const saveBtn = document.getElementById("save");

function onSaveClick(event) {
    const url = canvas.toDataURL();
    const a = document.createElement("a");
    a.href = url;
    a.download = "painting.png";
    a.click();
}

saveBtn.addEventListener("click", onSaveClick);


// 마우스 위치 보정
// CSS에서 설정한 rem 값을 실제 px로 변환하여 캔버스 크기 조정
function resizeCanvas() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const computedStyle = getComputedStyle(canvas);
    const widthInPx = parseFloat(computedStyle.width);  // "640px" → 640
    const heightInPx = parseFloat(computedStyle.height);

    // 캔버스의 논리적 크기 설정 (고해상도 대응)
    const scale = window.devicePixelRatio;  
    canvas.width = widthInPx * scale;
    canvas.height = heightInPx * scale;
    ctx.scale(scale, scale);  // 모든 드로잉 연산을 스케일링

    ctx.putImageData(imageData, 0, 0);
}

resizeCanvas();  // 초기 실행
window.addEventListener("resize", resizeCanvas);  // 창 크기 변경 시 적용

// 마우스 위치 보정 함수
function getMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
}
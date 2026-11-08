document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
     CONFIGURATION & DATA
     ========================================= */
  const PRIZES = [
    { name: "10% OFF", weight: 1, color: "#e6b96e", textColor: "#392419" },
    { name: "BETTER LUCK NEXT TIME", weight: 40 / 3, color: "#f5dfbd", textColor: "#573c27" },
    { name: "FREE DESSERT", weight: 13, color: "#75452c", textColor: "#fff8ed" },
    { name: "BETTER LUCK NEXT TIME", weight: 40 / 3, color: "#ead0a7", textColor: "#573c27" },
    { name: "250 ML COKE / SPRITE", weight: 13, color: "#a96535", textColor: "#fff8ed" },
    { name: "BETTER LUCK NEXT TIME", weight: 40 / 3, color: "#f5dfbd", textColor: "#573c27" },
    { name: "RE-SPIN", weight: 33, color: "#8c5936", textColor: "#fff8ed" }
  ];

  const TOTAL_WEIGHT = PRIZES.reduce((sum, prize) => sum + prize.weight, 0);
  const SPIN_DURATION_MS = 5600;

  /* =========================================
     DOM ELEMENTS
     ========================================= */
  const canvas = document.getElementById("wheel");
  const ctx = canvas.getContext("2d");
  const spinBtn = document.getElementById("spinBtn");
  
  const modal = document.getElementById("winnerModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const prizeNameEl = document.getElementById("prizeName");
  const claimText = document.getElementById("claimText");
  const modalIcon = document.getElementById("modalIcon");
  const modalButton = document.getElementById("modalButton");

  /* =========================================
     APP STATE
     ========================================= */
  let currentRotation = 0;
  let isSpinning = false;
  let canRespin = false;

  /* =========================================
     CANVAS RENDERING
     ========================================= */
  function drawWheel() {
    const center = canvas.width / 2;
    const radius = center - 12;
    let cumulativeWeight = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    PRIZES.forEach((prize) => {
      const startAngle = -Math.PI / 2 + (cumulativeWeight / TOTAL_WEIGHT) * Math.PI * 2;
      const endAngle = startAngle + (prize.weight / TOTAL_WEIGHT) * Math.PI * 2;
      const middleAngle = (startAngle + endAngle) / 2;

      // 1. Draw Segment Background
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = "#fff0dc";
      ctx.lineWidth = 4;
      ctx.stroke();

      // 2. Draw Text (Skip if segment is too narrow)
      if (prize.weight >= 5) {
        drawSegmentText(prize, center, radius, middleAngle);
      }

      cumulativeWeight += prize.weight;
    });

    // 3. Draw Outer Wheel Border
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#d4a66a";
    ctx.lineWidth = 10;
    ctx.stroke();
  }

  function drawSegmentText(prize, center, radius, middleAngle) {
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(middleAngle);
    
    ctx.fillStyle = prize.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 23px Arial";

    const words = prize.name.split(" ");
    const lines = [];
    let currentLine = "";
    const maxLineWidth = radius * 0.53;

    // Word wrapping logic
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxLineWidth) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);

    // Calculate vertical positioning to center the text block
    const textRadius = radius * 0.67;
    const lineHeight = 28;
    const startY = -textRadius - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line, 0, startY + (index * lineHeight));
    });

    ctx.restore();
  }

  /* =========================================
     GAME LOGIC
     ========================================= */
  function selectPrizeIndex() {
    const random = Math.random() * TOTAL_WEIGHT;
    let cumulative = 0;

    for (let i = 0; i < PRIZES.length; i++) {
      cumulative += PRIZES[i].weight;
      if (random < cumulative) return i;
    }
    return PRIZES.length - 1; // Fallback
  }

  function handleSpin() {
    if (isSpinning) return;
    isSpinning = true;

    // Update UI
    spinBtn.disabled = true;
    spinBtn.textContent = "SPINNING...";

    const selectedIndex = selectPrizeIndex();
    const selectedPrize = PRIZES[selectedIndex];

    // Calculate angles to stop perfectly in the center of the winning slice
    let cumulativePrecedingWeight = 0;
    for (let i = 0; i < selectedIndex; i++) {
      cumulativePrecedingWeight += PRIZES[i].weight;
    }

    const segmentCenter = -90 + ((cumulativePrecedingWeight + selectedPrize.weight / 2) / TOTAL_WEIGHT) * 360;
    const targetRotation = ((-90 - segmentCenter) % 360 + 360) % 360;
    const normalizedCurrent = ((currentRotation % 360) + 360) % 360;
    const adjustment = (targetRotation - normalizedCurrent + 360) % 360;
    
    // Add 5 to 7 full rotations for the spin effect
    const extraSpins = 360 * (5 + Math.floor(Math.random() * 3));
    currentRotation += extraSpins + adjustment;

    // Apply hardware-accelerated CSS transition
    canvas.style.transition = `transform ${SPIN_DURATION_MS / 1000}s cubic-bezier(0.12, 0.75, 0.12, 1)`;
    canvas.style.transform = `rotate(${currentRotation}deg)`;

    // Wait for transition to finish
    setTimeout(() => {
      isSpinning = false;
      spinBtn.disabled = false;
      spinBtn.textContent = "SPIN AGAIN";
      showResult(selectedPrize);
    }, SPIN_DURATION_MS);
  }

  /* =========================================
     UI & MODAL MANAGEMENT
     ========================================= */
  function showResult(prize) {
    prizeNameEl.textContent = prize.name;
    canRespin = false;

    if (prize.name === "BETTER LUCK NEXT TIME") {
      modalIcon.textContent = "😊";
      modalTitle.textContent = "THANK YOU FOR PLAYING!";
      modalDescription.textContent = "This time luck was not on your side.";
      claimText.textContent = "Thank you for visiting Rajya Rooftop. Enjoy your day!";
      modalButton.textContent = "CLOSE";
    } 
    else if (prize.name === "RE-SPIN") {
      modalIcon.textContent = "🎡";
      modalTitle.textContent = "LUCKY YOU!";
      modalDescription.textContent = "You have won another chance!";
      claimText.textContent = "Spin again to discover your surprise.";
      modalButton.textContent = "SPIN AGAIN";
      canRespin = true;
    } 
    else {
      modalIcon.textContent = "🎉";
      modalTitle.textContent = "CONGRATULATIONS!";
      modalDescription.textContent = "You have won a special café treat!";
      claimText.textContent = "Show this screen to our staff to claim your prize.";
      modalButton.textContent = "CLAIM MY PRIZE";
    }

    modal.classList.add("active"); // Uses 'active' to match standard UI patterns
  }

  function closeModal() {
    modal.classList.remove("active");
    if (canRespin) {
      canRespin = false;
      setTimeout(handleSpin, 350); // Slight delay for smoother UX
    }
  }

  /* =========================================
     EVENT LISTENERS & INITIALIZATION
     ========================================= */
  spinBtn.addEventListener("click", handleSpin);
  modalButton.addEventListener("click", closeModal);
  
  // Close modal when clicking outside the card
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Init
  drawWheel();
});

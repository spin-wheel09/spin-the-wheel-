// RAJYA ROOFTOP - SPIN & WIN
// Weighted prize wheel: total probability = 100%

const prizes = [
  {
    name: "10% OFF",
    weight: 1,
    color: "#e6b96e",
    textColor: "#392419"
  },
  {
    name: "BETTER LUCK NEXT TIME",
    weight: 40 / 3,
    color: "#f5dfbd",
    textColor: "#573c27"
  },
  {
    name: "FREE DESSERT",
    weight: 13,
    color: "#75452c",
    textColor: "#fff8ed"
  },
  {
    name: "BETTER LUCK NEXT TIME",
    weight: 40 / 3,
    color: "#ead0a7",
    textColor: "#573c27"
  },
  {
    name: "250 ML COKE / SPRITE",
    weight: 13,
    color: "#a96535",
    textColor: "#fff8ed"
  },
  {
    name: "BETTER LUCK NEXT TIME",
    weight: 40 / 3,
    color: "#f5dfbd",
    textColor: "#573c27"
  },
  {
    name: "RE-SPIN",
    weight: 33,
    color: "#8c5936",
    textColor: "#fff8ed"
  }
];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

const spinBtn = document.getElementById("spinBtn");
const modal = document.getElementById("winnerModal");
const modalButton = document.getElementById("modalButton");

const totalWeight = prizes.reduce(
  (sum, prize) => sum + prize.weight,
  0
);

let rotation = 0;
let spinning = false;
let canRespin = false;

// DRAW WHEEL

function drawWheel() {

  const center = canvas.width / 2;
  const radius = center - 12;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let cumulative = 0;

  prizes.forEach((prize) => {

    const startAngle =
      -Math.PI / 2 +
      (cumulative / totalWeight) * Math.PI * 2;

    const endAngle =
      startAngle +
      (prize.weight / totalWeight) * Math.PI * 2;

    const middleAngle = (startAngle + endAngle) / 2;

    // Draw segment

    ctx.beginPath();
    ctx.moveTo(center, center);

    ctx.arc(
      center,
      center,
      radius,
      startAngle,
      endAngle
    );

    ctx.closePath();

    ctx.fillStyle = prize.color;
    ctx.fill();

    ctx.strokeStyle = "#fff0dc";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw text only when the segment is large enough

    if (prize.weight >= 5) {

      ctx.save();

      ctx.translate(center, center);
      ctx.rotate(middleAngle);

      ctx.fillStyle = prize.textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const fontSize = 23;

      ctx.font = `bold ${fontSize}px Arial`;

      const words = prize.name.split(" ");
      const lines = [];
      let line = "";

      words.forEach(word => {

        const test = line
          ? line + " " + word
          : word;

        if (
          ctx.measureText(test).width >
          radius * 0.53
        ) {

          if (line) lines.push(line);
          line = word;

        } else {

          line = test;

        }

      });

      if (line) lines.push(line);

      const textRadius = radius * 0.67;
      const lineHeight = 28;

      const firstY =
        -textRadius -
        ((lines.length - 1) * lineHeight) / 2;

      lines.forEach((text, index) => {

        ctx.fillText(
          text,
          0,
          firstY + index * lineHeight
        );

      });

      ctx.restore();

    }

    cumulative += prize.weight;

  });

  // Outer wheel border

  ctx.beginPath();

  ctx.arc(
    center,
    center,
    radius,
    0,
    Math.PI * 2
  );

  ctx.strokeStyle = "#d4a66a";
  ctx.lineWidth = 10;
  ctx.stroke();

}

drawWheel();


// WEIGHTED RANDOM SELECTION

function selectPrize() {

  const random = Math.random() * totalWeight;

  let cumulative = 0;

  for (let i = 0; i < prizes.length; i++) {

    cumulative += prizes[i].weight;

    if (random < cumulative) {
      return i;
    }

  }

  return prizes.length - 1;

}


// SPIN WHEEL

function spinWheel() {

  if (spinning) return;

  spinning = true;

  spinBtn.disabled = true;
  spinBtn.textContent = "SPINNING...";

  const selectedIndex = selectPrize();

  let cumulative = 0;

  for (let i = 0; i < selectedIndex; i++) {
    cumulative += prizes[i].weight;
  }

  const selected = prizes[selectedIndex];

  // Find the center of the winning segment

  const segmentCenter =
    -90 +
    ((cumulative + selected.weight / 2) /
      totalWeight) * 360;

  // Position the winning segment at the top pointer

  const targetRotation =
    ((-90 - segmentCenter) % 360 + 360) % 360;

  const currentRotation =
    ((rotation % 360) + 360) % 360;

  const adjustment =
    (targetRotation - currentRotation + 360) % 360;

  // Five to seven complete rotations

  const extraSpins =
    360 * (5 + Math.floor(Math.random() * 3));

  rotation += extraSpins + adjustment;

  canvas.style.transition =
    "transform 5.5s cubic-bezier(0.12, 0.75, 0.12, 1)";

  canvas.style.transform =
    `rotate(${rotation}deg)`;

  setTimeout(() => {

    spinning = false;

    spinBtn.disabled = false;
    spinBtn.textContent = "SPIN AGAIN";

    showResult(selected);

  }, 5600);

}


// WINNER POPUP

function showResult(prize) {

  const title =
    document.getElementById("modalTitle");

  const description =
    document.getElementById("modalDescription");

  const prizeName =
    document.getElementById("prizeName");

  const claimText =
    document.getElementById("claimText");

  const icon =
    document.getElementById("modalIcon");

  prizeName.textContent = prize.name;

  canRespin = false;

  if (prize.name === "BETTER LUCK NEXT TIME") {

    icon.textContent = "😊";

    title.textContent = "THANK YOU FOR PLAYING!";

    description.textContent =
      "This time luck was not on your side.";

    claimText.textContent =
      "Thank you for visiting Rajya Rooftop. Enjoy your day!";

    modalButton.textContent = "CLOSE";

  }

  else if (prize.name === "RE-SPIN") {

    icon.textContent = "🎡";

    title.textContent = "LUCKY YOU!";

    description.textContent =
      "You have won another chance!";

    claimText.textContent =
      "Spin again to discover your surprise.";

    modalButton.textContent = "SPIN AGAIN";

    canRespin = true;

  }

  else {

    icon.textContent = "🎉";

    title.textContent = "CONGRATULATIONS!";

    description.textContent =
      "You have won a special café treat!";

    claimText.textContent =
      "Show this screen to our staff to claim your prize.";

    modalButton.textContent = "CLAIM MY PRIZE";

  }

  modal.classList.add("show");

}


// POPUP BUTTON

modalButton.addEventListener("click", () => {

  modal.classList.remove("show");

  if (canRespin) {

    canRespin = false;

    setTimeout(() => {
      spinWheel();
    }, 350);

  }

});


// SPIN BUTTON

spinBtn.addEventListener("click", spinWheel);


// CLOSE POPUP BY CLICKING OUTSIDE

modal.addEventListener("click", (event) => {

  if (event.target === modal) {

    modal.classList.remove("show");
    canRespin = false;

  }

});

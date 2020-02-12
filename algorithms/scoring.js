function calculateScore(arr) {
  // Total score per attribute

  let eatIn = 0;
  let takeAway = 0;
  let reusableCup = 0;
  let veg = 0;
  let dairy = 0;

  // Amount of scores per attribute
  let eatInCount = 0;
  let takeAwayCount = 0;
  let reusableCupCount = 0;
  let vegCount = 0;
  let dairyCount = 0;

  let score;
  let givenScores = [];
  // const totalAttributes = Object.keys(restaurantSchema).scores[0].length;

  for (const el of arr) {
    if (el.eatIn >= 0) {
      eatIn += el.eatIn;
      eatInCount++;
      if (givenScores.indexOf(eatIn) == -1) {
        givenScores.push(eatIn);
      }
    }
    if (el.takeAway >= 0) {
      takeAway += el.takeAway;
      takeAwayCount++;
      if (givenScores.indexOf(takeAway) == -1) {
        givenScores.push(takeAway);
      }
    }
    if (el.reusableCup >= 0) {
      reusableCup += el.reusableCup;
      reusableCupCount++;
      if (givenScores.indexOf(reusableCup) == -1) {
        givenScores.push(reusableCup);
      }
    }
    if (el.veg >= 0) {
      veg += el.veg;
      vegCount++;
      if (givenScores.indexOf(veg) == -1) {
        givenScores.push(veg);
      }
    }
    if (el.dairy >= 0) {
      dairy += el.dairy;
      dairyCount++;
      if (givenScores.indexOf(dairy) == -1) {
        givenScores.push(dairy);
      }
    }
  }

  if (eatInCount != 0) {
    eatIn = eatIn / eatInCount;
  }

  if (takeAwayCount != 0) {
    takeAway = takeAway / takeAwayCount;
  }

  if (reusableCupCount != 0) {
    reusableCup = reusableCup / reusableCupCount;
  }

  if (vegCount != 0) {
    veg = veg / vegCount;
  }

  if (dairyCount != 0) {
    dairy = dairy / dairyCount;
  }

  score = (eatIn + takeAway + reusableCup + veg + dairy) / givenScores.length;

  return Math.round(score * 10) / 10;
}

module.exports = calculateScore;

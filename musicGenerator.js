let masterVolume = 0;
let ready = false;
let isPlaying = false;

var keyNote = 3
var key
var chord = []
var bpm = 120
var noteLen = '8n'
var oneBarLength = (60 / bpm) * 4 
var noteNames = [ 'A', 'A#', 'B',
'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 
'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 
'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#' 
]

var bar1chord = []
var bar2chord = []
var bar3chord = []
var bar4chord = []

var bar1melody = []
var bar2melody = []
var bar3melody = []
var bar4melody = []

var bar1bass = []
var bar2bass = []
var bar3bass = []
var bar4bass = []



//a random integer generator
function rnd(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//resizes canvas when window changes
function windowResized() {
  if (windowWidth < 800){
    resizeCanvas(windowWidth *0.99, 300);
  }
}

//actives drawWaveform
function draw() {
  background(0);
  if (ready) {
    drawWaveform(wave);
  } 
  else {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    text("CLICK ANYWHERE", width / 2, height / 2);
  }
}

//draws the waveform for the visualizer
function drawWaveform(wave, w = width, h = height) {
  //this function was not my code, it was taken from some tutorial on youtube

  stroke(255);
  let buffer = wave.getValue(0);

  // look a trigger point where the samples are going from
  // negative to positive
  let start = 0;
  for (let i = 1; i < buffer.length; i++) {
    if (buffer[i - 1] < 0 && buffer[i] >= 0) {
      start = i;
      break; // interrupts a for loop
    }
  }

  // calculate a new end point such that we always
  // draw the same number of samples in each frame
  let end = start + buffer.length / 2;

  // drawing the waveform
  for (let i = start; i < end; i++) {
    let x1 = map(i - 1, start, end, 0, w);
    let y1 = map(buffer[i - 1], -1, 1, 0, h);
    let x2 = map(i, start, end, 0, w);
    let y2 = map(buffer[i], -1, 1, 0, h);
    line(x1, y1, x2, y2);
  }
}

//enables browser audio after the mouse is pressed the first time
function mousePressed(){
  if (!ready) {
    ready = true;
    Tone.start();
  }
}



//main function
function setup(){

 
  //updates bpm 
  bpmInput.addEventListener("input", function() {
    bpm = parseInt(bpmInput.value)
    Tone.Transport.bpm.value = bpm
    // console.log("BPM: " + bpm);
    bpmLabel.textContent = 'BPM: ' + bpm;

    oneBarLength = (60 / bpm) * 4
  });

  //updates key 
  keyInput.addEventListener("input", function() {
    keyNote = document.getElementById("keyInput").value
    keyNote = Number(keyNote -1);
    //console.log('Key: ' + noteNames[keyNote])
    handleSetup();
  });

  //functionality of play pause button
  playPause.addEventListener('click', function(){
    
    if (isPlaying) {
      Tone.Transport.start(Tone.Transport.position + 1);
      masterLoop.start(Tone.Transport.position + 1);
      isPlaying = true;
      playPause.textContent = 'Pause';

      Tone.Transport.cancel();
      masterLoop.stop();
      isPlaying = false;
      playPause.textContent = 'Play';
    } else {

      Tone.Transport.cancel();
      masterLoop.stop();
      isPlaying = false;
      playPause.textContent = 'Play';

      Tone.Transport.start(Tone.Transport.position + 1);
      masterLoop.start(Tone.Transport.position + 1);
      isPlaying = true;
      playPause.textContent = 'Pause';

    }
    
  });
  
  //re-rolls all the chords and melodies and such
  randomizeButton.addEventListener('click', function(){
    handleSetup();
  });


  function handleSetup(){
    Tone.Transport.cancel();
    masterLoop.stop();
    isPlaying = false;
    playPause.textContent = 'Play';
    
    setup();
    
    Tone.Transport.start(Tone.Transport.position + 1);
    masterLoop.start(Tone.Transport.position + 1);
    isPlaying = true;
    playPause.textContent = 'Pause';
  }

  //resets the melodies and basslines
  function resetLists(){

    bar1melody = []
    bar2melody = []
    bar3melody = []
    bar4melody = []

    bar1bass = []
    bar2bass = []
    bar3bass = []
    bar4bass = []

    isPlaying=false;


  }

  //selects the notes of the key based off the keyNote; it is pushed twice so it can reach up octaves / chord extensions
  function createKey(){
    key = [noteNames[keyNote], noteNames[keyNote+2], noteNames[keyNote+4], noteNames[keyNote+5], 
    noteNames[keyNote+7], noteNames[keyNote+9], noteNames[keyNote+11]];

    console.log('KEY-NOTE: ' + noteNames[keyNote])
    console.log('KEY: ' + key)

    key.push(key[0], key[1], key[2], key[3], key[4], key[5], key[6])
    key.push(key[0], key[1], key[2], key[3], key[4], key[5], key[6])

  }
  
  // a function that creates a new chord based on major scale intervals using the created key
  function makeNewChord(){
    var a = rnd(0,6)
    //a = number(a)
    var newChord = []
    //below code just appends each note to the newChord list one by one
    newChord.push(key[a], key[a+2], key[a+4], key[a+6])
    return newChord;
  }

  //generates a passing chord apropriate to the upcoming chord in the progression
  function makePassingChord(nextChordRoot){
    // random coin flip to decide which type of passing chord
    var chance = rnd(1,4)
    //this assigns b the index value of the upcoming chord's root note
    var b = noteNames.indexOf(nextChordRoot) 
    var passingChord = []

    //this option is the 50% chance of a V dom7 chord
    if (chance == 1){

      //there are 7 half steps between any note and its perfect fifth
      b = b + 7

      //the V dom7 passing chord is constructed with the following intervals
      passingChord.push(noteNames[b], noteNames[b+4], noteNames[b+7], noteNames[b+10])
      //console.log('Vdom7')
      return passingChord 
    }
  
    if (chance == 2){

      //the the fifth of any chord is 4 chords ahead 
      b = key.indexOf(nextChordRoot)
      b = b + 4

      //the V dom7 passing chord is constructed with the following intervals
      passingChord.push(key[b], key[b+2], key[b+4], key[b+6])
      //console.log('V')
      return passingChord 
    }

    //this option is the 25% chance of an adjacent chord
    if (chance == 3){
      //finds the index of the next chord's root within the key since the adjacent chord is diatonic
      b = key.indexOf(nextChordRoot) + 7

      // generates a coin flip for if the adjacency is going to be above or below
      var chance2 = rnd(1,2)

      if (chance2 ==  1){
        b = b-1}
      else {
        b = b+1}
      
      passingChord.push(key[b], key[b+2], key[b+4], key[b+6])
      //console.log('adjacent')
      return passingChord

    } 

    // this generates the dim7 passing, with a 2/3 chance of being a half step behind 
    // and a 1/3 chance of being on the ii of the upcoming chord
    if (chance == 4){


      var chance2 = rnd(1,3)

      if (chance2 ==  1 || chance2 == 2){
        b = b+6
      }
      else {
        b = b+2
      }

      passingChord.push(noteNames[b], noteNames[b+3], noteNames[b+6], noteNames[b+9])
      //console.log('dim7')
      return passingChord

    }




  }

  //makes a 4 bar chord progression, with the 2nd and 4th chords being passing chords
  //passing chords are 50% chance V dom7, 25% chance dim7, 25% chance of an adjacent diatonic chord
  function makeNewChordProgression(){
    createKey();

    bar1chord = makeNewChord()
    bar3chord = makeNewChord()

    bar2chord = makePassingChord(bar3chord[0])
    bar4chord = makePassingChord(bar1chord[0])

  }

  function createMelodyList(sourceArray, targetArray){
    //i randomizes 8 times because the melody consists of 8, eighth notes
    //it can pick any of the chord tones in the sourceArray as this suits the melody

    for (let i = 0; i < 8; i++) {
      const randomIndex = rnd(0, sourceArray.length-1)
      const randomItem = sourceArray[randomIndex];
      targetArray.push(randomItem);

    }

  }

  function createMelody(){
    createMelodyList(bar1chord, bar1melody)
    createMelodyList(bar2chord, bar2melody)
    createMelodyList(bar3chord, bar3melody)
    createMelodyList(bar4chord, bar4melody)

    //the 3 is mapped on so it plays in the third octave
    
    bar1melody = bar1melody.map(item => item + '4');
    bar2melody = bar2melody.map(item => item + '4');
    bar3melody = bar3melody.map(item => item + '4');
    bar4melody = bar4melody.map(item => item + '4');
    
  }

  function allConsoleLogs(){
    console.clear();

    console.log('VOL: ' + masterVolume) 
    console.log('BPM: ' + bpm)
    console.log('KEY: ' + noteNames[keyNote])

    console.log('')

    console.log('BASE CHORDS')
    console.log(bar1chord)
    console.log(bar2chord)
    console.log(bar3chord)
    console.log(bar4chord)

    console.log('MELODIES')
    console.log(bar1melody)
    console.log(bar2melody)
    console.log(bar3melody)
    console.log(bar4melody)

  }

  function updateNoteDisplay(){
    bar1display.textContent = 'Bar 1 Melody: ' + bar1melody
    bar2display.textContent = 'Bar 2 Melody: ' + bar2melody
    bar3display.textContent = 'Bar 3 Melody: ' + bar3melody
    bar4display.textContent = 'Bar 4 Melody: ' +bar4melody
  }

 //creates canvas for visualizer
  createCanvas(800, 300);

  //primary function calls
  resetLists();
  makeNewChordProgression();
  createMelody();
  allConsoleLogs();
  updateNoteDisplay();


  let lead = new Tone.Synth();
  lead.connect(Tone.Master);


  //get the sequences and the main loop setup   
  let bar1melodyline = new Tone.Sequence((time, note) => {
    lead.triggerAttackRelease(note, '8n', time);
    console.log('bar 1')
  }, bar1melody)

  let bar2melodyline = new Tone.Sequence((time, note) => {
    lead.triggerAttackRelease(note, '8n', time);
    console.log('bar 2')
  }, bar2melody)

  let bar3melodyline = new Tone.Sequence((time, note) => {
    lead.triggerAttackRelease(note, '8n', time);
    console.log('bar 3')
  }, bar3melody)

  let bar4melodyline = new Tone.Sequence((time, note) => {
    lead.triggerAttackRelease(note, '8n', time);
    console.log('bar 4')
  }, bar4melody);


  let masterLoop = new Tone.Loop((time) =>{

    bar1melodyline.start(time);
    bar1melodyline.stop(time + oneBarLength)
    bar2melodyline.start(time + oneBarLength)
    bar2melodyline.stop(time + oneBarLength*2)
    bar3melodyline.start(time + oneBarLength*2)
    bar3melodyline.stop(time + oneBarLength*3)
    bar4melodyline.start(time + oneBarLength*3)
    bar4melodyline.stop(time + oneBarLength*4)
    
  }, oneBarLength*4);


  //initialize waveform for visualizer 
  wave = new Tone.Waveform();
  Tone.Master.connect(wave);


  //initialize audio
  Tone.Master.volume.value = masterVolume;
  Tone.Transport.bpm.value = bpm
  Tone.Transport.timeSignature = 4;
  
}










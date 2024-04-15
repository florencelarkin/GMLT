

/*
 * Example plugin template
 */
var jsPsychISTGrid = (function (jspsych) {
  'use strict';

  const info = {
      name: "ist-grid",
      parameters: {
          /** The HTML string to be displayed */
          stimulus: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Stimulus",
              default: undefined,
          },
          /** Array containing the label(s) for the button(s). */
          choices: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Choices",
              default: undefined,
              array: true,
          },
          /** The HTML for creating button. Can create own style. Use the "%choice%" string to indicate where the label from the choices parameter should be inserted. */
          button_html: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Button HTML",
              default: '<button class="jspsych-btn">%choice%</button>',
              array: true,
          },
          decreasing: {
            type: jspsych.ParameterType.BOOL,
            pretty_name: "Decreasing Condition",
            default: false,
        },
          /** Any content here will be displayed under the button(s). */
          points: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Points",
              default: undefined,
          },
          wins: {
            type: jspsych.ParameterType.INT,
            pretty_name: "Wins",
            default: undefined,
        },
          /** How long to show the stimulus. */
          stimulus_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Stimulus duration",
              default: null,
          },
          /** How long to show the trial. */
          trial_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Trial duration",
              default: null,
          },
          /** The vertical margin of the button. */
          margin_vertical: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Margin vertical",
              default: "0px",
          },
          /** The horizontal margin of the button. */
          margin_horizontal: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Margin horizontal",
              default: "8px",
          },
          /** If true, then trial will end when user responds. */
          response_ends_trial: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Response ends trial",
              default: true,
          },
      },
  };
  /**
   based on html button response plugin, added grid to stimulus
   */
  class ISTGridPlugin {
      constructor(jsPsych) {
          this.jsPsych = jsPsych;
      }
      trial(display_element, trial) {
      // display stimulus
      let potentialPoints = 0;
      let wins = 0;
      trial.decreasing === true ? potentialPoints = 250 : potentialPoints = 100;
      var gridSquares = '';
      for (var i = 0; i < trial.stimulus.length; i++) {
      trial.stimulus[i] === 'yellow' ? gridSquares +='<div class="y" id=s' + i + '></div>' : gridSquares +='<div class="b" id=s' + i + '></div>';
      
    }
    
    var html = '<div id="ist-points">Wins: ' + trial.wins + '&nbsp &nbsp &nbsp Current Points: ' + trial.points + '&nbsp &nbsp &nbsp Potential Points: '+ potentialPoints + ' </div>' ; 
    html += '<div id="ist-grid"><div class= "grid-container">' + gridSquares + '</div></div>'
      

        //display buttons
          var buttons = [];
          if (Array.isArray(trial.button_html)) {
              if (trial.button_html.length == trial.choices.length) {
                  buttons = trial.button_html;
              }
              else {
                  console.error("Error in plugin. The length of the button_html array does not equal the length of the choices array");
              }
          }
          else {
              for (var i = 0; i < trial.choices.length; i++) {
                  buttons.push(trial.button_html);
              }
          }
          html += '<div id="response-btngroup"><div class="responsebutton0" id="response-button-0" data-choice="0"></div><div class="responsebutton1" id="response-button-1" data-choice="1"></div>';
          /*for (var i = 0; i < 2; i++) {
              var str = buttons[i].replace(/%choice%/g, '        ');
              html +=
                  '<div class="responsebutton' + i +'" style="background-color: display: inline-block; margin:' +
                      trial.margin_vertical +
                      " " +
                      trial.margin_horizontal +
                      '" id="jspsych-html-button-response-button-' +
                      i +
                      '" data-choice="' +
                      i +
                      '">' +
                      str +
                      "</div>";
          }*/
          html += "</div>";
          
          display_element.innerHTML = html;
          // start time
          var start_time = performance.now();

          
          let pressedSquares = [];

          function changeText(potentialPoints)
          {
            document.getElementById('ist-points').innerHTML = 'Wins: ' + trial.wins + '&nbsp &nbsp &nbsp Current Points: ' + trial.points + '&nbsp &nbsp &nbsp Potential Points: '+ potentialPoints;
          }
          
          //event listener for squares
          for (var i = 0; i < trial.stimulus.length; i++) {
            display_element
                .querySelector("#s" + i)
                .addEventListener("click", (e) => {
                var selectedSquare = e.currentTarget;
                //record which square was pressed and when
                var id = selectedSquare.getAttribute("id");
                var currentTime = performance.now();
                var pressTime = Math.round(currentTime - start_time);
                pressedSquares.push([id, pressTime]);
                //change the color
                var color = selectedSquare.getAttribute("class");  
                color === 'y' ? selectedSquare.style.backgroundColor = '#ffdb47' : selectedSquare.style.backgroundColor = '#44a5d8'
                if (selectedSquare.getAttribute("disabled") != "disabled"){
                  trial.decreasing === true ? potentialPoints = potentialPoints - 10 : potentialPoints = 100;
                  trial.decreasing === true ? changeText(potentialPoints): changeText(potentialPoints);
                }
                else {

                }
                selectedSquare.setAttribute("disabled", "disabled"); //disable square button
                //if decreasing win condition, subtract points 
            });
        } 
          // add event listeners to buttons
          for (var i = 0; i < trial.choices.length; i++) {
              display_element
                  .querySelector("#response-button-" + i)
                  .addEventListener("click", (e) => {
                  var btn_el = e.currentTarget;
                  var choice = btn_el.getAttribute("data-choice"); // don't use dataset for jsdom compatibility
                  after_response(choice);
              });
          }
          // store response
          var response = {
              rt: null,
              button: null,
              answer: null,
              correct: null,
          };
          // function to end trial when it is time
          const end_trial = () => {
            //console.log(pressedSquares)
              // kill any remaining setTimeout handlers
              this.jsPsych.pluginAPI.clearAllTimeouts();
              // gather the data to store for the trial
              var trial_data = {
                  rt: response.rt,
                  stimulus: trial.stimulus,
                  response: response.button, //what they picked
                  answer: response.answer, //what the correct answer was
                  correct: response.correct, //if they picked correctly
                  pressed: pressedSquares,
                  points: trial.points,
                  potentialPoints: potentialPoints,
                  decreasing: trial.decreasing,
              };
              // clear the display
              display_element.innerHTML = "";
              // move on to the next trial
              this.jsPsych.finishTrial(trial_data);
          };
          // function to handle responses by the subject
          function after_response(choice) {
              // measure rt
              var end_time = performance.now();
              var rt = Math.round(end_time - start_time);
              response.button = parseInt(choice);
              response.rt = rt;
              //list of squares pressed and when
            
              function getCorrect(array) {
                var count = 0;
                var answer = '';
                for(var i = 0; i < array.length; ++i){
                if(array[i] == 'yellow')
                    count++;
            }
            count > 12 ? answer = 'yellow, 0' : answer = 'blue, 1'
            return answer
            }
            response.answer = getCorrect(trial.stimulus)

            if (response.answer === 'yellow, 0' && response.button === 0) {
              response.correct = true
            } 
            else if (response.answer === 'blue, 1' && response.button === 1) {
              response.correct = true
              
            }
            else {
              response.correct = false
          
            }
              // after a valid response, the stimulus will have the CSS class 'responded'
              // which can be used to provide visual feedback that a response was recorded
              display_element.querySelector("#ist-grid").className +=
                  " responded";
              // disable all the buttons after a response
              var btns = document.querySelectorAll(".response-button button");
              for (var i = 0; i < btns.length; i++) {
                  //btns[i].removeEventListener('click');
                  btns[i].setAttribute("disabled", "disabled");
              }
              if (trial.response_ends_trial) {
                  end_trial();
              }
          }
          // hide image if timing is set
          if (trial.stimulus_duration !== null) {
              this.jsPsych.pluginAPI.setTimeout(() => {
                  display_element.querySelector("#ist-grid").style.visibility = "hidden";
              }, trial.stimulus_duration);
          }
          // end trial if time limit is set
          if (trial.trial_duration !== null) {
              this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
          }
      }
  }
  ISTGridPlugin.info = info;

  return ISTGridPlugin;

})(jsPsychModule);


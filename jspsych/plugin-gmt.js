

/*
 * Example plugin template
 */
var jsPsychGMT = (function (jspsych) {
  'use strict';

  const info = {
      name: "gmt",
      parameters: {
          /** The HTML string to be displayed */
          stimulus: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Stimulus",
              default: undefined,
          },
          
          /** The HTML for creating button. Can create own style. Use the "%choice%" string to indicate where the label from the choices parameter should be inserted. */
          button_html: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Button HTML",
              default: '<button class="jspsych-btn">%choice%</button>',
              array: true,
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
  class GMTPlugin {
      constructor(jsPsych) {
          this.jsPsych = jsPsych;
      }
      trial(display_element, trial) {
      // display stimulus
      let wins = 0;
      
      var gridSquares = '';
      for (var i = 0; i < 100; i++) {
        if (i === 0) {
            gridSquares += '<div class="sq1" id=s0></div>'
        }
        else if (i === 99) {
            gridSquares += '<div class="sq99" id=s99><i style="font-size:48px;color:red;padding:8px" class="fa">&#xf140;</i></div>'
        }
        else {
            trial.stimulus.includes(i) ? gridSquares +='<div class="y" id=s' + i + '></div>' : gridSquares +='<div class="b" id=s' + i + '></div>';
        }
      //this designates path squares from non path squares (old)
      //tbh this doesn't actually do anything i think so i might change it in future now that i have the test if legal methods
     
      
    }

    var html = '<div id="gmt-grid"><div class= "grid-container">' + gridSquares + '</div></div>'
      

       
          html += "</div>";
          
          display_element.innerHTML = html;
          
          // start time
          var start_time = performance.now();

          
          let pressedSquares = [];
          var mazeList = trial.stimulus;
          let totalMoves = 0;
          let correctCount = 0;
          let totalErrors = 0; //all errors
          let legalErrors = 0; //errors within maze rules but incorrect guess
          let rulebreakErrors = 0; //errors that break rules ex diagonal
          let consecErrors = 0; //if there's multiple errors in a row
          let returnCount = 0; //return to head, meaning return to prev correct square after making mistake
          let prevSquare = '';
          let squareLegal = false;
          let onPath = false;

          function legal_test(prevSquare, selectedSquare) {
            console.log(pressedSquares.length)
            if (pressedSquares.length === 0 && selectedSquare === 0) {
                //first square
                return true
            }
            else if (Math.abs(selectedSquare - prevSquare) === 1 || Math.abs(selectedSquare - prevSquare)  === 10) {
                //every other square that isn't diagonal or skipped
                return true
            }
            else {
                rulebreakErrors++;
                return false
            } 
            
          }

          function path_test(selectedSquare) {
            if (mazeList.includes(selectedSquare)) {
                return true 
            }
            else {
                return false
            }
            
          }

          console.log(mazeList);
          //event listener for squares
          //TODO: add mercy rule - not in original cogstate task but could still be helpful (see flutter version)
          //TODO: flashing green check or flashing red x? still want to keep square 'lit up' to reduce pt confusion
          for (var i = 0; i < 100; i++) {
            
            display_element
                .querySelector("#s" + i)
                .addEventListener("click", (e) => {
                var selectedSquare = e.currentTarget;
                //record which square was pressed and when (keep)
                //selectedList.push(selectedSquare);
                totalMoves++;
                var id = selectedSquare.getAttribute("id");

                //take the number out of the id and turn it into int
                var idNum = id.slice(1);
                idNum = parseInt(idNum);
                console.log(idNum);

                //test if move is correct
                squareLegal = legal_test(prevSquare, idNum);
                onPath = path_test(idNum);
                console.log(squareLegal);
                console.log(onPath);

                //record press time
                var currentTime = performance.now();
                var pressTime = Math.round(currentTime - start_time);
                

                if (pressedSquares.length >= 2) {
                    console.log('hi');
                    clearSquare('s' + prevSquare)
                }
                else {

                }
                
                
                //after fn is called current square becomes prev square
                prevSquare = idNum;

                 //change the color
                if (squareLegal === true && onPath === true) {
                    pressedSquares.push([id, pressTime, 'correct']);
                    correctCount++;
                    consecErrors > 0 ? returnCount++ : returnCount = returnCount;
                    if (idNum === 99) {
                        //if square is correct and square is last on path, end trial
                        selectedSquare.style.backgroundColor = 'yellowgreen'
                        after_response();
                    }
                    else {
                    selectedSquare.style.backgroundColor = 'yellowgreen'
                    
                    //reset consecutive errors
                    consecErrors = 0;
                     }
                
                }
                else if (squareLegal === true && onPath === false) {
                    //legal but wrong guess
                    pressedSquares.push([id, pressTime, 'error']);
                    legalErrors++;
                    selectedSquare.style.backgroundColor = 'red'
                    totalErrors++;
                }
                else {
                    pressedSquares.push([id, pressTime, 'error']);
                    //illegal move
                    selectedSquare.style.backgroundColor = 'red'
                    totalErrors++;
                    consecErrors++;
                    
                }

               
               
                
            });
            
        } 

        function clearSquare(id) {
            document.getElementById(id).style.backgroundColor = "gray";
          }
          
          // store response
          var response = {
              time: null,
          };

          // function to end trial when it is time
          const end_trial = () => 
          {
           console.log('i was called')
           
             // kill any remaining setTimeout handlers
             this.jsPsych.pluginAPI.clearAllTimeouts();
             // gather the data to store for the trial
             var trial_data = {
                 time: response.rt,
                 maze: trial.stimulus,
                 pressed: pressedSquares,
                 total_errors: totalErrors,
                 legal_errors: legalErrors, 
                 rulebreak_errors: rulebreakErrors, 
                 correct_moves: correctCount,
                 mps: mps, //change this: calculate moves / total task time in seconds
                 //add perseverative errors?
                 //add return to head moves??
                
             };
             // clear the display
             display_element.innerHTML = "";
             // move on to the next trial
             this.jsPsych.finishTrial(trial_data);
         };
         let mps = 0;
         
          // function to handle responses by the subject
          function after_response() {
              // measure rt
              var end_time = performance.now();
              var rt = Math.round(end_time - start_time);
              
              response.rt = rt;
              //list of squares pressed and when
              mps = totalMoves / (rt / 1000);
            
              // after a valid response, the stimulus will have the CSS class 'responded'
              // which can be used to provide visual feedback that a response was recorded
              display_element.querySelector("#gmt-grid").className +=
                  " responded";
              
              if (trial.response_ends_trial) {
                  end_trial();
              }
          }
          // hide image if timing is set
          if (trial.stimulus_duration !== null) {
              this.jsPsych.pluginAPI.setTimeout(() => {
                  display_element.querySelector("#gmt-grid").style.visibility = "hidden";
              }, trial.stimulus_duration);
          }
          // end trial if time limit is set
          if (trial.trial_duration !== null) {
              this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
          }
      }
  }
  GMTPlugin.info = info;

  return GMTPlugin;

})(jsPsychModule);


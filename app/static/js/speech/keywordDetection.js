    var speechRec = new JsSpeechRecognizer();
    speechRec.openMic();
    var treshold=0.5; //seuil minimun de reconnaissance

    $(document).ready(function() {

        //bouton d'entrainement
        $("#startStopRecordingButton").click(function() {
            if (!speechRec.isRecording()) {
                var word = $("#currentKeyword").val();
                speechRec.startTrainingRecording(word);

                //actualise l'interface
                $("#startStopRecordingButton").val("Arrêter l'entrainement");
                $("#startStopRecognition").prop('disabled', true);

            } else {
                var recordingId = speechRec.stopRecording();

                //actualise l'interface
                $("#startStopRecordingButton").val("Lancer l'entrainement");
                $("#startStopRecognition").prop('disabled', false);

                //ajoute le nouvel échantillon à la liste
                var playbackDivId = "playbackResultId" + recordingId;
                var playButtonId = "playRecordingButton" + recordingId;
                var deleteButtonId = "deleteRecordingButton" + recordingId;
                
                var appendHtml = '<tr id=' + playbackDivId + '>';
                appendHtml += '<td>enregistrement #' + recordingId +' pour le mot <b>' + $("#currentKeyword").val() + '</b></td>';
                appendHtml += '<td><input type="button" class="button blue" value="lire" id="' + playButtonId + '" /></td>';
                appendHtml += '<td><input type="button" class="button blue" value="supprimer" id="' + deleteButtonId + '" /></td>';
                appendHtml += '</tr>';

                $("#training").append(appendHtml);

                //ajoute le bouton de lecture
                var finalPlaybackId = recordingId - 1;
                $("#" + playButtonId).click(function() {
                    speechRec.playTrainingBuffer(finalPlaybackId);
                });

                //ajoute le bouton de suppression
                $("#" + deleteButtonId).click(function() {
                    $("#" + playbackDivId).hide();
                    speechRec.deleteTrainingBuffer(finalPlaybackId);
                    speechRec.generateModel();
                });

                //recharge le modèle
                speechRec.generateModel();

            }
        });

        //input permettant de charger un modèle entrainé
        $("#inputDataset").on("change", function(){
            var input= $('#inputDataset').prop('files')[0];
            var fr = new FileReader();
            fr.onload = function () {
                var json=$.parseJSON( fr.result );
                speechRec.model=json[0];
                speechRec.wordBuffer=json[1];
                speechRec.modelBuffer=json[2];
                console.log(speechRec.model);
                console.log(speechRec.wordBuffer);
                console.log(speechRec.modelBuffer);
            };
            fr.readAsText(input);
        });
        
        //bouton permettant de sauvegarder le modèle
        $("#saveButton").click(function() {
            var json=[];
            json.push(speechRec.model);
            json.push(speechRec.wordBuffer);
            json.push(speechRec.modelBuffer);
            download(JSON.stringify(json), "dataset.txt");
        });

        //bouton permettant de lancer la reconnaissance
        $("#startStopRecognition").click(function() {
            if (!speechRec.isRecording() && !recognizing) {
                // Update the UI and prevent the training button from being pressed
                $("#startStopRecognition").val("Arrêter la reconnaissance");
                $("#startStopRecordingButton").prop('disabled', true);
                    
                speechRec.startKeywordSpottingRecording();
            } else {
                $("#startStopRecognition").val("Lancer la reconnaissance");
                $("#startStopRecordingButton").prop('disabled', false);
                    
                speechRec.stopRecording();
            }
            speechRec.keywordSpottingMinConfidence = treshold;
        });

        //fonction appelée quand le mot clé est reconnu
        var updateKeywordSpotting = function(result) {
            if(!recognizing){
                var timeId = new Date().getTime();
                var playbackDivId = "playbackKeywordSpotId" + timeId;

                var appendHtml = '<li id=' + playbackDivId + '>';
                appendHtml += '<b> '+ result.match + '</b> ';
                appendHtml += '</li>';

                $("#detectionResult").append(appendHtml);
                startDictation(); //on commence la reconnaissance quand le mot est reconnu
            }
        };
        speechRec.keywordSpottedCallback=updateKeywordSpotting;

    });

    //permet de télécharger le modèle entrainé
    function download(data, filename) {
        var file = new Blob([data], {type: 'text/plain'});
	    if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
	    else { // Others
            var a = document.createElement("a"),
            url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);  
            }, 0); 
        }
    }
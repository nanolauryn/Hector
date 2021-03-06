$(document).ready(function() {

	//directly play a sequence in the list
	$("#playSeqButton").on("click", function(){
		if($("#sequence").val()!==null && $("#sequence").val()!==""){
			socket.emit('play_sequence', $("#sequence").val());
		}
	});

	//update status information about a specified relay
	socket.on('update_relay_state', function(relay) {
		$( "div[action='relay:"+relay.label+"']" ).each(function(){
			if(relay.state===1){
				$(this).addClass('green');
				$(this).removeClass('dark-red');
			}
			else if(relay.state===0){
				$(this).addClass('dark-red');
				$(this).removeClass('green');
			}
		})
	});

	$("#addButton").on("click", function(){
		var buttonLabel=$("#buttonLabel").val();
		var color=$("#color").val();

		var action=null;
		var sequence=null;
		if ($("#relayChoice").prop("checked") == true) {
			action="relay:"+$("#relays").val();
			//if the relay isn't already used
			if(actionAlreadyUsed(action)){
				alertModal("Un bouton correspondant au même relai existe déjà.");
				return;
			}
		} else if ($("#sequenceChoice").prop("checked") == true) {
			sequence=$("#sequences").val();
			if(sequenceAlreadyUsed(sequence)){
				alertModal("Un bouton correspondant à la même sequence existe déjà.");
				return;
			}
		} else if ($("#soundChoice").prop("checked") == true) {
			action="sound:"+$("#sounds").val();
			//if the sound isn't already used
			if(actionAlreadyUsed(action)){
				alertModal("Un bouton correspondant au même son existe déjà.");
				return;
			}
		}
		
		addButton(buttonLabel, action, sequence, color, 1, 1, 1, 1);
	});

	$('input[type=radio][name=choice]').on("change", function() {
		updateForm();
	});

});

//update the form to display the options corresponding to the type of button chosen
function updateForm() {
	$("#relays").addClass("hide");
	$("#sequences").addClass("hide");
	$("#sounds").addClass("hide");
	if ($("#relayChoice").prop("checked") == true) {
		$("#relays").removeClass("hide");
	} else if ($("#sequenceChoice").prop("checked") == true) {
		$("#sequences").removeClass("hide");
	} else if ($("#soundChoice").prop("checked") == true) {
		$("#sounds").removeClass("hide");
	}
}


//check if a button with the same action already exists
function actionAlreadyUsed(label){
	var found=false;
	$('.grid-stack-item-content').each(function(){
		if($(this).data("action")===label){
			found=true;
			return false;
		}
	});
	return found;
}

//check if a button with the same sequence already exists
function sequenceAlreadyUsed(label){
	var found=false;
	$('.grid-stack-item-content').each(function(){
		if($(this).data("sequence")===label){
			found=true;
			return false;
		}
	});
	return found;
}
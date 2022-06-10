import {calculateTm} from 've-sequence-utils'

export function clearSequence(sequence){
  return sequence.replace(/[^acgtACGT]/g, '');
}


export function getReverseSequenceString(sequence){
  return sequence.split("").reverse().join("");;
}

function complement(sequence){
  return { A: 'T', T: 'A', G: 'C', C: 'G', a: 't', t: 'a', g: 'c', c: 'g' }[sequence];
}

export function getComplementSequenceString(sequence){
  return sequence.split('').map(complement).join('');
}


export function getReverseComplementSequenceString(sequence){
  return getReverseSequenceString(getComplementSequenceString(sequence));
}

export function tmSeq(seq, tm){
    let seq_final = ""
    if (seq.length){
        for(let i = 1; i<seq.length; i++){
            if (tmCalc(seq.substring(0,i)) > tm){
                seq_final = seq.substring(0,i)
                break
            }
        }
    }
    return seq_final
}

function tmCalc(seq){
    return calculateTm(seq)
}
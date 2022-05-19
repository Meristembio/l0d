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

export function tm60(seq){
    let seq60 = ""
    if (seq.length){
        for(let i = 1; i<seq.length; i++){
            if (tm(seq.substring(0,i)) > 60){
                seq60 = seq.substring(0,i)
                break
            }
        }
    }
    return seq60
}

function tm(seq){
    return calculateTm(seq)
}

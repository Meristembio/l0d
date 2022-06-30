const L0DPartsStandards = {
  loop: {
    name: 'Loop',
    enzyme: 'sapi',
    bases_upto_snip: 'a',
    receiver_ohs: {
      oh5: 'TCC',
      oh3: 'CGA'
    },
    domestication_enzymes:[
        'aari',
        'bsai',
        'sapi'
    ],
    default: {
      5: 'a',
      3: 'b'
    },
    ohs: {
      a: {
        name: 'A',
        oh: 'GGAG'
      },
      b: {
        name: 'B',
        oh: 'TACT'
      },
      c: {
        name: 'C',
        oh: 'AATG'
      },
      d: {
        name: 'D',
        oh: 'AGGT',
        tc: true
      },
      e: {
        name: 'E',
        oh: 'GCTT',
        stop: true
      },
      f: {
        name: 'F',
        oh: 'CGCT'
      },
      x: {
        name: 'X',
        oh: 'TGGA',
        tc: true
      },
    }
  },
  moclo:{
    name: 'MoClo',
    enzyme: 'bbsi',
    bases_upto_snip: 'aa',
    default: {
      5: 'p5',
      3: 'p3u5'
    },
    domestication_enzymes:[
        'bsai',
        'bbsi',
    ],
    ohs: {
      p5: {
        name: 'P.5\'',
        oh: 'GGAG'
      },
      p3u5: {
        name: 'P.3\'-U.5\'',
        oh: 'TACT'
      },
      u3sp5: {
        name: 'U.3\'-SP.5\'',
        oh: 'AATG'
      },
      sp3cds5: {
        name: 'SP.3\'-CDS.5\'',
        oh: 'AGGT',
        tc: true
      },
      cds3t5: {
        name: 'CDS.3\'-T.5\'',
        oh: 'GCTT',
        stop: true
      },
      t3: {
        name: 'T.3\'',
        oh: 'CGCT'
      },
    },
  }
}

export default L0DPartsStandards;

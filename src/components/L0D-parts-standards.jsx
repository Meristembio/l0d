const L0DPartsStandards = {
  loop: {
    name: 'Loop',
    enzyme: 'sapi',
    bases_upto_snip: 'a',
    l0_receiver: {
      name: 'pL0R-mRFP1',
      ohs: {
        oh5: 'TCC',
        oh3: 'CGA'
      },      
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
  gb: {
    name:"GoldenBraid 2.0",
    enzyme: 'bsmbi',
    bases_upto_snip: 'a',
    domestication_enzymes:[
      'bsai',
      'bsmbi'
    ],
    l0_receiver: {
      name: '',
      ohs: {
        oh5: '',
        oh3: ''
      },      
    },
    default: {
      5: 'nt01',
      3: 'tr13'
    },
    ohs: {
      nt01: {
        name: '5\'NT 01 5\'',
        oh: 'GGAG'
      },
      nt02: {
        name: '5\'NT 02 5\'',
        oh: 'TGAC'
      },
      nt03: {
        name: '5\'NT 03 5\'',
        oh: 'TCCC'
      },
      tr11: {
        name: 'TR 11 5\'',
        oh: 'TACT'
      },
      tr12: {
        name: 'TR 12 5\'',
        oh: 'CCAT'
      },
      tr13: {
        name: 'TR 13 5\'',
        oh: 'AATG'
      },
      tr14: {
        name: 'TR 14 5\'',
        oh: 'AGCC',
        tc: true
      },
      tr15: {
        name: 'TR 15 5\'',
        oh: 'TTCG',
        tc: true
      },
      tr16: {
        name: 'TR 16 5\'',
        oh: 'GCAG',
        tc: true
      },
      tr17: {
        name: 'TR 17 5\'',
        oh: 'GCTT'
      },
      nt21: {
        name: '3\'NT 21 5\'',
        oh: 'GGTA'
      },
      nt213: {
        name: '3\'NT 21 3\'',
        oh: 'CGCT'
      },
    }
  },
  moclo:{
    name: 'MoClo',
    enzyme: 'bpii',
    bases_upto_snip: 'aa',
    default: {
      5: 'p5',
      3: 'p3u5'
    },
    l0_receiver: {
      name: '',
      ohs: {
        oh5: '',
        oh3: ''
      },      
    },
    domestication_enzymes:[
        'bsai',
        'bpii',
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

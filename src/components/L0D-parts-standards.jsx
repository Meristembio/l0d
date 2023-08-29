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
      name: 'pUPD',
      ohs: {
        oh5: 'CTCG',
        oh3: 'CGAG'
      },      
    },
    default: {
      5: 'a1_5',
      3: 'a2_5'
    },
    ohs: {
      a1_5: {
        name: 'A1 5\'',
        oh: 'GGAG'
      },
      a2_5: {
        name: 'A2 5\'',
        oh: 'TGAC'
      },
      a3_5: {
        name: 'A3 5\'',
        oh: 'TCCC'
      },
      b1_5: {
        name: 'B1 5\'',
        oh: 'TACT'
      },
      b2_5: {
        name: 'B2 5\'',
        oh: 'CCAT'
      },
      b3_5: {
        name: 'B3 5\'',
        oh: 'AATG'
      },
      b4_5: {
        name: 'B4 5\'',
        oh: 'AGCC',
        tc: true
      },
      b5_5: {
        name: 'B5 5\'',
        oh: 'TTCG',
        tc: true
      },
      b6_5: {
        name: 'B6 5\'',
        oh: 'GCTT',
        stop: true
      },
      c1_5: {
        name: 'C1 5\'',
        oh: 'GGTA'
      },
      c1_3: {
        name: 'C1 3\'',
        oh: 'CGCT'
      },
    }
  },
  moclo:{
    name: 'MoClo',
    enzyme: 'bpii',
    bases_upto_snip: 'aa',
    default: {
      5: 'a',
      3: 'b'
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
    },
  }
}

export default L0DPartsStandards;

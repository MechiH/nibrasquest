const PATHS = {
  prophet: {
    id: "prophet",
    icon: "🌙",
    color: "#d4a843",
    name: { ar: "السيرة النبوية", en: "Prophet Life" },
    desc: {
      ar: "رحلة زمنية عبر مراحل السيرة مع انتقالات بصرية بين العصور.",
      en: "A time-based journey across the eras of the Prophet's life.",
    },
    refs: [
      ["الرحيق المختوم", "سيرة مرتبة للمراحل"],
      ["فقه السيرة", "فهم الحدث والدروس"],
      ["This path can later link to verified biographies", "Reference slot"],
    ],
    endorsers: ["مدرسو السيرة", "برامج المساجد", "حلقات الشباب"],
    stages: [
      {
        id: 1,
        icon: "🏜️",
        x: 170,
        y: 540,
        era: "makkah",
        eraIcon: "🏜️",
        eraLabel: { ar: "مكة قبل البعثة", en: "Pre-Revelation Makkah" },
        eraTheme: { ar: "المجتمع والبيئة", en: "Society and setting" },
        title: { ar: "العالم قبل النور", en: "Before the Light" },
        focus: {
          ar: "بيئة الجزيرة وقيمها وتحدياتها",
          en: "Arabia, values, and challenges",
        },
        goal: {
          ar: "فهم المشهد الذي سبق الرسالة",
          en: "Understand the world before revelation",
        },
        story: {
          ar: [
            "تبدأ الرحلة من الجزيرة العربية قبل البعثة، حيث كانت البيئة قاسية لكنها غنية بالقيم واللغة والشعر.",
            "كان المجتمع يحمل جوانب قوة وضعف، ويحتاج إلى ميزان جديد يعيد ترتيب الإنسان والحياة.",
            "هذه المرحلة تمهّد لفهم لماذا كانت الرسالة تحوّلًا جذريًا لا مجرد حدث عابر.",
          ],
          en: [
            "The journey begins in Arabia before revelation, where the environment was harsh yet rich in values, language, and poetry.",
            "Society had strengths and weaknesses, and it needed a new balance for human life.",
            "This stage explains why the message was a transformation, not a passing event.",
          ],
        },
        quiz: [
          {
            q: {
              ar: "ما الهدف من هذه المرحلة؟",
              en: "What is the goal of this stage?",
            },
            o: {
              ar: [
                "فهم المشهد السابق للرسالة",
                "حفظ الأنساب فقط",
                "تعلم الفقه فقط",
                "دراسة التجارة فقط",
              ],
              en: [
                "Understand the world before revelation",
                "Memorize lineages only",
                "Study only fiqh",
                "Study only trade",
              ],
            },
            a: 0,
          },
          {
            q: {
              ar: "ماذا تميّزت به البيئة؟",
              en: "What characterized the environment?",
            },
            o: {
              ar: [
                "القسوة واللغة والشعر",
                "الثلوج والغابات",
                "المدن الحديثة",
                "الأنهار الكبيرة",
              ],
              en: [
                "Harshness, language, and poetry",
                "Snow and forests",
                "Modern cities",
                "Great rivers",
              ],
            },
            a: 0,
          },
        ],
        reading: [
          ["الرحيق المختوم", "مدخل سردي"],
          ["فقه السيرة", "زاوية تحليلية"],
        ],
        endorse: ["معلم سيرة", "حلقة شباب", "برنامج تأسيسي"],
      },
      {
        id: 2,
        icon: "⭐",
        x: 470,
        y: 410,
        era: "makkah",
        eraIcon: "⭐",
        eraLabel: { ar: "مولد النبي ﷺ", en: "Birth Era" },
        eraTheme: { ar: "البدايات الأولى", en: "Early beginnings" },
        title: { ar: "المولد والنشأة", en: "Birth and Upbringing" },
        focus: {
          ar: "النشأة والتهيئة المبكرة",
          en: "Early upbringing and preparation",
        },
        goal: {
          ar: "رؤية أثر التربية والابتلاء المبكر",
          en: "See how early trials shaped character",
        },
        story: {
          ar: [
            "في عام الفيل وُلد النبي ﷺ، وبدأت مرحلة التهيئة الربانية المبكرة.",
            "تتابعت عليه الابتلاءات في طفولته، لكنها صنعت الرحمة والثبات والوعي.",
            "كل تفصيل في النشأة يقدّم مفتاحًا لفهم القيادة النبوية لاحقًا.",
          ],
          en: [
            "In the Year of the Elephant, the Prophet ﷺ was born and an early divine preparation began.",
            "Trials in childhood shaped mercy, steadiness, and awareness.",
            "Each detail of his upbringing helps explain later prophetic leadership.",
          ],
        },
        quiz: [
          {
            q: {
              ar: "ما الذي صنعته الابتلاءات المبكرة؟",
              en: "What did the early trials shape?",
            },
            o: {
              ar: ["الرحمة والثبات", "السلطة والثروة", "الشهرة", "العزلة فقط"],
              en: [
                "Mercy and steadiness",
                "Power and wealth",
                "Fame",
                "Isolation only",
              ],
            },
            a: 0,
          },
          {
            q: {
              ar: "هذه المرحلة تساعد على فهم ماذا؟",
              en: "This stage helps explain what?",
            },
            o: {
              ar: [
                "القيادة النبوية لاحقًا",
                "اللغة فقط",
                "التجارة فقط",
                "الجغرافيا فقط",
              ],
              en: [
                "Later prophetic leadership",
                "Only language",
                "Only trade",
                "Only geography",
              ],
            },
            a: 0,
          },
        ],
        reading: [
          ["شمائل النبي", "البعد الشخصي"],
          ["فقه السيرة", "ربط الحدث بالمعنى"],
        ],
        endorse: ["خطباء الجمعة", "مركز السيرة", "مرشد أسري"],
      },
      {
        id: 3,
        icon: "🕯️",
        x: 760,
        y: 250,
        era: "revelation",
        eraIcon: "🕯️",
        eraLabel: { ar: "بداية الوحي", en: "Beginning of Revelation" },
        eraTheme: { ar: "التحول الرسالي", en: "Message begins" },
        title: { ar: "نزول الوحي", en: "First Revelation" },
        focus: { ar: "من الخلوة إلى التكليف", en: "From retreat to mission" },
        goal: {
          ar: "فهم بداية الرسالة والتحول النفسي",
          en: "Understand the beginning of revelation",
        },
        story: {
          ar: [
            "كان غار حراء محطة تأمل عميق، حتى جاءت لحظة اقرأ وبدأ التحول الأكبر.",
            "هنا تنتقل السيرة من التهيئة إلى الرسالة، ومن الفرد إلى الأمة.",
            "الحدث ليس مجرد بداية نص، بل بداية تغيير تاريخي شامل.",
          ],
          en: [
            "Cave Hira was a place of deep reflection until the moment of Read transformed everything.",
            "The story moves from preparation to mission, and from the individual to the community.",
            "This was not just the start of a text, but of a civilizational change.",
          ],
        },
        quiz: [
          {
            q: {
              ar: "إلى ماذا انتقلت السيرة هنا؟",
              en: "What did the story transition to here?",
            },
            o: {
              ar: [
                "من التهيئة إلى الرسالة",
                "من المدينة إلى الريف",
                "من التجارة إلى الزراعة",
                "من اللغة إلى النحو",
              ],
              en: [
                "From preparation to mission",
                "From city to countryside",
                "From trade to farming",
                "From language to grammar",
              ],
            },
            a: 0,
          },
          {
            q: { ar: "لماذا هذا الحدث كبير؟", en: "Why is this event major?" },
            o: {
              ar: [
                "بداية تغيير تاريخي شامل",
                "لأنه حدث شخصي فقط",
                "لأنه اقتصادي",
                "لأنه عسكري",
              ],
              en: [
                "It begins a civilizational shift",
                "It was only personal",
                "It was economic",
                "It was military",
              ],
            },
            a: 0,
          },
        ],
        reading: [
          ["الوحي في السيرة", "البداية الرسالية"],
          ["دلائل النبوة", "أثر الحدث"],
        ],
        endorse: ["مدرس قرآن", "باحث سيرة", "مجلس علم"],
      },
      {
        id: 4,
        icon: "🕌",
        x: 930,
        y: 150,
        era: "madinah",
        eraIcon: "🕌",
        eraLabel: { ar: "المدينة وبناء الأمة", en: "Madinah and Ummah" },
        eraTheme: { ar: "المجتمع والنظام", en: "Community and order" },
        title: { ar: "بناء المجتمع", en: "Building the Community" },
        focus: {
          ar: "الأخوة والتنظيم والقيم العملية",
          en: "Brotherhood, order, applied values",
        },
        goal: {
          ar: "فهم كيف تحوّلت الرسالة إلى مجتمع حي",
          en: "See how the message became a living society",
        },
        story: {
          ar: [
            "في المدينة ظهرت السيرة في صورتها الاجتماعية والسياسية والتربوية.",
            "انتقل المسلمون من مرحلة التأسيس الفردي إلى بناء جماعة وقيم ونظام.",
            "هذا التحول يمنح المتعلم رؤية أوسع للسيرة بوصفها مشروع حياة.",
          ],
          en: [
            "In Madinah, the prophetic life appeared in its social, civic, and educational dimensions.",
            "Muslims moved from individual formation to building a value-based community.",
            "This gives the learner a wider view of the Prophet's life as a full way of life.",
          ],
        },
        quiz: [
          {
            q: { ar: "ماذا ظهر في المدينة؟", en: "What emerged in Madinah?" },
            o: {
              ar: [
                "البعد الاجتماعي والنظام",
                "الشعر فقط",
                "التجارة فقط",
                "اللغة فقط",
              ],
              en: [
                "Social and civic order",
                "Only poetry",
                "Only trade",
                "Only language",
              ],
            },
            a: 0,
          },
          {
            q: {
              ar: "كيف ننظر للسيرة هنا؟",
              en: "How is the prophetic life viewed here?",
            },
            o: {
              ar: ["كمشروع حياة", "كحدث منعزل", "كقصة قصيرة", "كمهارة لغوية"],
              en: [
                "As a way of life",
                "As an isolated event",
                "As a short story",
                "As a language skill",
              ],
            },
            a: 0,
          },
        ],
        reading: [
          ["السيرة في المدينة", "البعد المجتمعي"],
          ["السياسة الشرعية التأسيسية", "قراءة مؤسسية"],
        ],
        endorse: ["أستاذ تربية", "مرشد شبابي", "إمام مسجد"],
      },
    ],
  },
  principles: {
    id: "principles",
    icon: "⚖️",
    color: "#60a5fa",
    name: { ar: "مبادئ الإسلام", en: "Islam Principles" },
    desc: {
      ar: "خريطة موضوعية للأركان والمقاصد والأخلاق والعبادات والمعاملات.",
      en: "A thematic map of pillars, ethics, objectives, and practice.",
    },
    refs: [
      ["الأربعون النووية", "مدخل جامع"],
      ["رياض الصالحين", "تهذيب عملي"],
      ["Later verified curriculum slots", "Reference slot"],
    ],
    endorsers: ["معلم تأسيسي", "مرشد مسجد", "برنامج ناشئة"],
    stages: [
      {
        id: 1,
        icon: "🧭",
        x: 180,
        y: 540,
        era: "core",
        eraIcon: "🧭",
        eraLabel: { ar: "الأساس", en: "Foundation" },
        eraTheme: { ar: "لماذا الإسلام", en: "Why Islam" },
        title: { ar: "الرؤية الكلية", en: "Big Picture" },
        focus: {
          ar: "ما الإسلام ولماذا نتعلمه بنظام",
          en: "What Islam is and how to study it",
        },
        goal: {
          ar: "بناء تصور شامل قبل التفاصيل",
          en: "Build the big picture before details",
        },
        story: {
          ar: [
            "هذا المسار لا يبدأ بالتفاصيل المتفرقة، بل بالصورة الكبرى.",
            "فهم المبادئ قبل الجزئيات يجعل التعلّم أعمق وأثبت.",
            "كل محطة لاحقة ستنطلق من هذا البناء الكلي.",
          ],
          en: [
            "This path begins with the big picture, not scattered details.",
            "Understanding principles before details makes learning deeper and more stable.",
            "Every later stage grows out of this foundation.",
          ],
        },
        quiz: [
          {
            q: { ar: "كيف يبدأ هذا المسار؟", en: "How does this path begin?" },
            o: {
              ar: [
                "بالصورة الكبرى",
                "بالجزئيات فقط",
                "بالخلافات",
                "بالجداول فقط",
              ],
              en: [
                "With the big picture",
                "With details only",
                "With disputes",
                "With tables only",
              ],
            },
            a: 0,
          },
          {
            q: { ar: "لماذا نبدأ بالمبادئ؟", en: "Why begin with principles?" },
            o: {
              ar: ["لثبات الفهم", "لإطالة الوقت", "لتقليل التعلم", "للتشويش"],
              en: [
                "For stable understanding",
                "To waste time",
                "To reduce learning",
                "To confuse",
              ],
            },
            a: 0,
          },
        ],
        reading: [
          ["الأربعون النووية", "مدخل"],
          ["مدارج التعلم", "تصور تأسيسي"],
        ],
        endorse: ["معلم تأسيسي", "دورة للمبتدئين", "حلقة ناشئة"],
      },
      {
        id: 2,
        icon: "🕌",
        x: 520,
        y: 420,
        era: "pillars",
        eraIcon: "🕌",
        eraLabel: { ar: "الأركان", en: "Pillars" },
        eraTheme: { ar: "البناء العملي", en: "Core practice" },
        title: { ar: "الأركان والعبادات", en: "Pillars and Worship" },
        focus: {
          ar: "العبادات كصناعة للإنسان",
          en: "Worship as human formation",
        },
        goal: {
          ar: "ربط العبادة بالمعنى لا بالشكل فقط",
          en: "Connect worship to meaning",
        },
        story: {
          ar: [
            "الأركان ليست مهام منفصلة، بل بناء متكامل يصوغ القلب والسلوك.",
            "كل عبادة تحمل أثرًا تربويًا ومعنى مقصودًا.",
            "حين يفهم الطالب هذا المعنى تصبح العبادة أوضح وأقرب.",
          ],
          en: [
            "The pillars are not separate tasks but an integrated system shaping heart and conduct.",
            "Each act of worship has an intended formative effect.",
            "When learners see that meaning, worship becomes clearer and closer.",
          ],
        },
        quiz: [
          {
            q: { ar: "الأركان هي ماذا؟", en: "The pillars are what?" },
            o: {
              ar: [
                "بناء متكامل",
                "أعمال منفصلة فقط",
                "ألفاظ فقط",
                "معلومات نظرية فقط",
              ],
              en: [
                "An integrated structure",
                "Separate acts only",
                "Only phrases",
                "Only theory",
              ],
            },
            a: 0,
          },
          {
            q: {
              ar: "ما المطلوب ربطه بالعبادة؟",
              en: "What should be linked to worship?",
            },
            o: {
              ar: ["المعنى", "الشكل فقط", "العادة فقط", "السرعة"],
              en: ["Meaning", "Form only", "Habit only", "Speed"],
            },
            a: 0,
          },
        ],
        reading: [
          ["فقه العبادات الميسر", "مدخل عملي"],
          ["رياض الصالحين", "تزكية"],
          ["كتاب الأركان", "مراجعة منهجية"],
        ],
        endorse: ["إمام مسجد", "معلم فقه", "مدرب ناشئة"],
      },
      {
        id: 3,
        icon: "🤝",
        x: 820,
        y: 260,
        era: "ethics",
        eraIcon: "🤝",
        eraLabel: { ar: "الأخلاق والمعاملات", en: "Ethics" },
        eraTheme: { ar: "الإسلام في الواقع", en: "Islam in life" },
        title: { ar: "الأخلاق والمعاملة", en: "Ethics and Conduct" },
        focus: {
          ar: "كيف يظهر الإسلام في التعامل اليومي",
          en: "How Islam appears in daily conduct",
        },
        goal: { ar: "تحويل القيم إلى سلوك", en: "Turn values into behavior" },
        story: {
          ar: [
            "المبدأ الحقيقي يظهر في المعاملة، لا في المعرفة النظرية فقط.",
            "هذا الجزء يجعل الإسلام حاضرًا في الأسرة والعمل والعلاقات.",
            "كل قيمة هنا يمكن تحويلها إلى مهمة تطبيقية داخل التجربة.",
          ],
          en: [
            "Real principles appear in conduct, not theory alone.",
            "This section places Islam into family, work, and relationships.",
            "Each value here can become an in-app practical mission.",
          ],
        },
        quiz: [
          {
            q: {
              ar: "أين يظهر المبدأ الحقيقي؟",
              en: "Where do real principles appear?",
            },
            o: {
              ar: [
                "في المعاملة",
                "في العناوين فقط",
                "في الزينة فقط",
                "في الشعارات فقط",
              ],
              en: [
                "In conduct",
                "Only in titles",
                "Only in decoration",
                "Only in slogans",
              ],
            },
            a: 0,
          },
          {
            q: { ar: "ما الهدف هنا؟", en: "What is the aim here?" },
            o: {
              ar: [
                "تحويل القيم إلى سلوك",
                "زيادة الحفظ فقط",
                "تقليل التطبيق",
                "الانفصال عن الواقع",
              ],
              en: [
                "Turn values into behavior",
                "Memorize more only",
                "Reduce application",
                "Disconnect from life",
              ],
            },
            a: 0,
          },
        ],
        reading: [
          ["الأدب المفرد", "أخلاق"],
          ["رياض الصالحين", "سلوك"],
          ["فقه المعاملات الميسر", "التطبيق"],
        ],
        endorse: ["مرشد أسري", "مربي", "خطيب"],
      },
    ],
  },
  faith: {
    id: "faith",
    icon: "✨",
    color: "#9b59b6",
    name: { ar: "الإيمان والعقيدة", en: "Faith" },
    desc: {
      ar: "رحلة تبني اليقين والفهم المتدرج في مسائل الإيمان.",
      en: "A gradual path to conviction and understanding in faith.",
    },
    refs: [
      ["كتاب التوحيد", "مدخل موضوعي"],
      ["العقيدة الواسطية", "بناء علمي"],
      ["Later verified theology references", "Reference slot"],
    ],
    endorsers: ["معلم عقيدة", "حلقة تأسيس", "مرشد شباب"],
    stages: [
      {
        id: 1,
        icon: "💡",
        x: 180,
        y: 540,
        era: "intro",
        eraIcon: "💡",
        eraLabel: { ar: "البداية", en: "Intro" },
        eraTheme: { ar: "لماذا الإيمان", en: "Why faith" },
        title: { ar: "معنى الإيمان", en: "Meaning of Faith" },
        focus: {
          ar: "التصور الأولي للإيمان وآثاره",
          en: "What faith means and how it affects life",
        },
        goal: {
          ar: "بناء بداية مطمئنة لا معقدة",
          en: "A calm and clear beginning",
        },
        story: {
          ar: [
            "هذا المسار يقدّم الإيمان بوصفه حياة ومعنى ويقينًا، لا مجرد مصطلحات.",
            "البدء الهادئ يجعل الطالب أكثر قدرة على الاستمرار والفهم.",
            "ثم تتدرج الرحلة نحو موضوعات أعمق دون قفز مفاجئ.",
          ],
          en: [
            "This path presents faith as meaning, life, and conviction, not just terminology.",
            "A calm beginning helps learners continue with clarity.",
            "Then the journey deepens gradually without abrupt jumps.",
          ],
        },
        quiz: [
          {
            q: {
              ar: "كيف يقدَّم الإيمان هنا؟",
              en: "How is faith presented here?",
            },
            o: {
              ar: [
                "كحياة ومعنى ويقين",
                "كمصطلحات فقط",
                "كخلافات فقط",
                "كمعلومات مجردة",
              ],
              en: [
                "As life, meaning, and conviction",
                "As terminology only",
                "As disputes only",
                "As abstract info",
              ],
            },
            a: 0,
          },
          {
            q: {
              ar: "ماذا يحقق البدء الهادئ؟",
              en: "What does a calm beginning achieve?",
            },
            o: {
              ar: ["الاستمرار والوضوح", "الملل", "التعقيد", "الانقطاع"],
              en: [
                "Continuation and clarity",
                "Boredom",
                "Complexity",
                "Drop-off",
              ],
            },
            a: 0,
          },
        ],
        reading: [
          ["كتاب التوحيد", "مدخل"],
          ["العقيدة الميسرة", "تدرج"],
        ],
        endorse: ["معلم عقيدة", "دورة تمهيدية", "مرشد شباب"],
      },
      {
        id: 2,
        icon: "🛡️",
        x: 520,
        y: 420,
        era: "beliefs",
        eraIcon: "🛡️",
        eraLabel: { ar: "الأصول", en: "Core Beliefs" },
        eraTheme: { ar: "الأساس العلمي", en: "Scientific foundation" },
        title: { ar: "أصول الاعتقاد", en: "Core Beliefs" },
        focus: {
          ar: "الأركان العقدية وموقعها من الحياة",
          en: "Faith pillars and their role",
        },
        goal: {
          ar: "تكوين بنية معرفية واضحة",
          en: "Build a clear doctrinal structure",
        },
        story: {
          ar: [
            "بعد التمهيد تأتي البنية العقدية المنظمة.",
            "هنا يتعرّف الطالب على الأركان بطريقة تربط بين العلم والطمأنينة.",
            "كل ركن يصبح بابًا لفهم أوسع لا مجرد عنوان محفوظ.",
          ],
          en: [
            "After the introduction comes the organized doctrinal structure.",
            "Here the learner meets the pillars of faith in a way that joins knowledge and reassurance.",
            "Each pillar becomes a doorway to broader understanding.",
          ],
        },
        quiz: [
          {
            q: {
              ar: "كيف نتعامل مع الأركان هنا؟",
              en: "How are the pillars treated here?",
            },
            o: {
              ar: [
                "كأبواب لفهم أوسع",
                "كعناوين محفوظة فقط",
                "كأرقام فقط",
                "كأسئلة امتحان فقط",
              ],
              en: [
                "As doors to wider understanding",
                "As memorized titles only",
                "As numbers only",
                "As test items only",
              ],
            },
            a: 0,
          },
          {
            q: { ar: "ماذا نبني هنا؟", en: "What is built here?" },
            o: {
              ar: [
                "بنية معرفية واضحة",
                "غموضًا أكبر",
                "حفظًا بلا فهم",
                "تشتتًا",
              ],
              en: [
                "A clear structure",
                "More confusion",
                "Memorization without understanding",
                "Distraction",
              ],
            },
            a: 0,
          },
        ],
        reading: [
          ["العقيدة الواسطية", "بناء علمي"],
          ["شرح أركان الإيمان", "تبسيط"],
        ],
        endorse: ["مدرس علمي", "حلقة مسجد", "نادي شبابي"],
      },
      {
        id: 3,
        icon: "🌌",
        x: 820,
        y: 260,
        era: "reflection",
        eraIcon: "🌌",
        eraLabel: { ar: "اليقين والتأمل", en: "Reflection" },
        eraTheme: {
          ar: "من العلم إلى اليقين",
          en: "From knowledge to conviction",
        },
        title: { ar: "اليقين والتدبر", en: "Conviction and Reflection" },
        focus: {
          ar: "كيف يتحول العلم إلى ثبات",
          en: "How knowledge becomes firmness",
        },
        goal: { ar: "الربط بين الدليل والقلب", en: "Link proof and the heart" },
        story: {
          ar: [
            "الإيمان لا يكتمل عند جمع المعلومات فقط، بل عندما يتحول إلى سكينة وثبات.",
            "هذه المرحلة تفتح باب التأمل والتدبر وربط المعنى بالواقع.",
            "هنا تصبح الرحلة أعمق وأكثر شخصنة للمتعلم.",
          ],
          en: [
            "Faith is not complete by collecting information alone, but when it becomes calm and steadiness.",
            "This stage opens reflection and connection to lived reality.",
            "Here the journey becomes deeper and more personal.",
          ],
        },
        quiz: [
          {
            q: {
              ar: "متى يكتمل الإيمان تربويًا؟",
              en: "When does faith become complete educationally?",
            },
            o: {
              ar: [
                "عندما يتحول إلى ثبات",
                "عند جمع المعلومات فقط",
                "عند كثرة الجدل",
                "عند التكرار فقط",
              ],
              en: [
                "When it becomes firmness",
                "When it is only information",
                "When there is much debate",
                "When it is mere repetition",
              ],
            },
            a: 0,
          },
          {
            q: {
              ar: "ماذا تربط هذه المرحلة؟",
              en: "What does this stage connect?",
            },
            o: {
              ar: [
                "الدليل والقلب",
                "الحفظ والسرعة",
                "الجدل فقط",
                "الأرقام فقط",
              ],
              en: [
                "Proof and the heart",
                "Memory and speed",
                "Debate only",
                "Numbers only",
              ],
            },
            a: 0,
          },
        ],
        reading: [
          ["مدارج السالكين - مختارات", "تزكية ويقين"],
          ["التدبر الإيماني", "معايشة"],
        ],
        endorse: ["مربٍّ", "معلم تدبر", "مشرف حلقة"],
      },
    ],
  },
  grammar: {
    id: "grammar",
    icon: "✍️",
    color: "#52b788",
    name: { ar: "النحو العربي", en: "Arabic Grammar" },
    desc: {
      ar: "من الجملة إلى الإعراب فالتراكيب في خريطة أوضح وأسهل.",
      en: "A clear map from sentence basics to grammar patterns.",
    },
    refs: [
      ["الآجرومية", "بداية كلاسيكية"],
      ["النحو الواضح", "تدرج تعليمي"],
      ["Later verified Arabic references", "Reference slot"],
    ],
    endorsers: ["معلم لغة", "حلقة عربية", "برنامج قرائي"],
    stages: [
      {
        id: 1,
        icon: "🔤",
        x: 180,
        y: 540,
        era: "sentence",
        eraIcon: "🔤",
        eraLabel: { ar: "مدخل الجملة", en: "Sentence Entry" },
        eraTheme: { ar: "الأساس", en: "Foundation" },
        title: { ar: "أنواع الكلام والجملة", en: "Speech and Sentences" },
        focus: {
          ar: "فهم البنية قبل الإعراب",
          en: "Understand structure before parsing",
        },
        goal: {
          ar: "إزالة رهبة النحو في البداية",
          en: "Remove the fear of grammar",
        },
        story: {
          ar: [
            "هذا المسار يجعل النحو أقرب وأوضح، ويبدأ بالبنية قبل المصطلح الثقيل.",
            "حين يفهم الطالب الجملة أولًا يصبح الإعراب أسهل بكثير.",
            "التدرج هنا مهم حتى لا يتحول النحو إلى عبء.",
          ],
          en: [
            "This path makes grammar clearer and friendlier, beginning with structure before heavy terms.",
            "When the learner understands the sentence first, parsing becomes much easier.",
            "Gradual pacing matters so grammar does not feel burdensome.",
          ],
        },
        quiz: [
          {
            q: {
              ar: "بماذا يبدأ هذا المسار؟",
              en: "What does this path begin with?",
            },
            o: {
              ar: [
                "بالبنية قبل المصطلح",
                "بالإعراب التفصيلي مباشرة",
                "بالخلافات النحوية",
                "بالأبواب المتقدمة",
              ],
              en: [
                "Structure before terminology",
                "Detailed parsing immediately",
                "Grammar disputes",
                "Advanced chapters",
              ],
            },
            a: 0,
          },
          {
            q: { ar: "ما الفائدة من ذلك؟", en: "What is the benefit?" },
            o: {
              ar: [
                "إزالة الرهبة",
                "زيادة التعقيد",
                "إبطاء التعلم",
                "منع الفهم",
              ],
              en: [
                "Removes fear",
                "Adds complexity",
                "Slows learning",
                "Blocks understanding",
              ],
            },
            a: 0,
          },
        ],
        reading: [
          ["الآجرومية", "مدخل"],
          ["النحو الواضح", "تدرج"],
        ],
        endorse: ["معلم لغة", "مدرب تأسيسي", "برنامج لسان"],
      },
      {
        id: 2,
        icon: "📘",
        x: 520,
        y: 420,
        era: "i3rab",
        eraIcon: "📘",
        eraLabel: { ar: "الإعراب", en: "Parsing" },
        eraTheme: { ar: "المهارة الأساسية", en: "Core skill" },
        title: { ar: "علامات الإعراب", en: "Parsing Marks" },
        focus: {
          ar: "من الفهم إلى التطبيق",
          en: "From understanding to application",
        },
        goal: {
          ar: "تثبيت العلامات بطريقة ممتعة",
          en: "Make parsing signs memorable",
        },
        story: {
          ar: [
            "بعد فهم الجملة تأتي علامات الإعراب كأداة قراءة وفهم أدق.",
            "في النسخة القادمة يمكن تحويلها إلى تحديات سحب وإفلات وتركيب بصري.",
            "هذا يجعل النحو أقرب إلى اللعبة التعليمية لا الحفظ الجاف.",
          ],
          en: [
            "After understanding the sentence, parsing marks become a tool for precise reading.",
            "In later versions this can become drag-and-drop visual challenges.",
            "That turns grammar into a learning game instead of dry memorization.",
          ],
        },
        quiz: [
          {
            q: { ar: "علامات الإعراب هي ماذا؟", en: "Parsing marks are what?" },
            o: {
              ar: [
                "أداة فهم أدق",
                "زينة لغوية",
                "حفظ بلا معنى",
                "تفصيل غير مهم",
              ],
              en: [
                "A tool for precise understanding",
                "Decoration",
                "Meaningless memorization",
                "Unimportant detail",
              ],
            },
            a: 0,
          },
          {
            q: {
              ar: "كيف يمكن تطويرها لاحقًا؟",
              en: "How can this be improved later?",
            },
            o: {
              ar: [
                "بتحديات بصرية",
                "بحذف التطبيق",
                "بتقليل الأمثلة",
                "بإلغاء التدرج",
              ],
              en: [
                "With visual challenges",
                "By removing practice",
                "By reducing examples",
                "By removing progression",
              ],
            },
            a: 0,
          },
        ],
        reading: [
          ["النحو الواضح", "تمارين"],
          ["شذا العرف - مختارات", "توسيع"],
        ],
        endorse: ["معلم نحو", "مصحح لغة", "حلقة قراءة"],
      },
      {
        id: 3,
        icon: "🧩",
        x: 820,
        y: 260,
        era: "patterns",
        eraIcon: "🧩",
        eraLabel: { ar: "التراكيب", en: "Patterns" },
        eraTheme: { ar: "اللعب بالتركيب", en: "Structure play" },
        title: { ar: "تراكيب وجمل", en: "Patterns and Structures" },
        focus: {
          ar: "بناء الجملة وتحويلها",
          en: "Build and transform structures",
        },
        goal: {
          ar: "الوصول إلى مرحلة التطبيق الذكي",
          en: "Reach smart application",
        },
        story: {
          ar: [
            "هنا يصبح النحو مهارة تركيب وبناء، لا مجرد تعريفات.",
            "يمكن للمتعلم أن يرى كيف تتغير الجملة وكيف يعمل كل عنصر داخلها.",
            "هذه أفضل منطقة لإضافة ألغاز وتحديات لعبية أقوى.",
          ],
          en: [
            "Here grammar becomes a skill of constructing and transforming sentences, not mere definitions.",
            "The learner sees how sentences change and how each part functions.",
            "This is the best area for stronger puzzle mechanics.",
          ],
        },
        quiz: [
          {
            q: { ar: "كيف يصبح النحو هنا؟", en: "How does grammar feel here?" },
            o: {
              ar: ["مهارة تركيب", "تعريفات فقط", "حفظ فقط", "شيئًا جامدًا"],
              en: [
                "A construction skill",
                "Definitions only",
                "Memory only",
                "Something rigid",
              ],
            },
            a: 0,
          },
          {
            q: {
              ar: "أفضل إضافة مستقبلية هنا؟",
              en: "Best future upgrade here?",
            },
            o: {
              ar: [
                "ألغاز وتحديات",
                "تقليل التفاعل",
                "حذف الأمثلة",
                "إخفاء الجمل",
              ],
              en: [
                "Puzzles and challenges",
                "Less interaction",
                "Remove examples",
                "Hide sentences",
              ],
            },
            a: 0,
          },
        ],
        reading: [
          ["تمارين نحوية", "تطبيق"],
          ["تحليل الجملة العربية", "توسيع"],
        ],
        endorse: ["مدرب لغة", "برنامج لغوي", "نادي قرائي"],
      },
    ],
  },
};
const LEVELS = ["beginner", "intermediate", "advanced"];
const ACHIEVEMENTS = [
  {
    id: "first",
    icon: "🌟",
    name: { ar: "أول خطوة", en: "First Step" },
    check: (g) =>
      Object.values(g.completed).reduce((a, b) => a + b.length, 0) >= 1,
  },
  {
    id: "perfect",
    icon: "🏆",
    name: { ar: "نتيجة مثالية", en: "Perfect Score" },
    check: (g, ctx) => ctx.perfect,
  },
  {
    id: "paths",
    icon: "🧭",
    name: { ar: "مكتشف المسارات", en: "Path Explorer" },
    check: (g) => Object.keys(g.pathSeen).length >= 2,
  },
  {
    id: "gems",
    icon: "💎",
    name: { ar: "جامع الجواهر", en: "Gem Collector" },
    check: (g) => g.gems >= 3,
  },
];
const COPY = {
  ar: {
    heroKicker: "رحلة الضوء",
    logo: "نبراس",
    heroSub: "مسارات تعلّم أعمق وأكثر لعبية",
    mission:
      "اختر مسارًا، حدّد مستواك، تقدّم على خريطة خاصة بكل موضوع، وافتح محتوى أعمق مع تتبع شامل للتقدّم ومراجع مقترحة للتوسّع.",
    start: "▶ اختر المسار",
    demo: "★ عرض الإنجازات",
    pathsTitle: "اختر مسار التعلّم",
    pathsSub:
      "ابدأ من المبتدئ حتى لو كنت متقدمًا. هذا يعطيك تسلسلًا أوضح ويقوي التجربة. ويمكنك رفع المستوى مباشرة متى شئت.",
    pathsControl: "اضبط نقطة البداية ثم اختر أسلوب التقدّم.",
    pathsProgress: "التقدم الكلي",
    pathsCompleted: "مراحل مكتملة",
    pathsFilterAll: "الكل",
    pathsFilterFresh: "جديد",
    pathsFilterActive: "قيد التقدّم",
    pathsFilterMastered: "مكتمل",
    pathsNoResult: "لا توجد مسارات مطابقة لهذا الفلتر.",
    pathsNextQuest: "المهمة التالية",
    pathsEnter: "ادخل المسار",
    pathsFreshState: "جديد",
    pathsActiveState: "نشط",
    pathsMasteredState: "منجز",
    chip1: "🧭 مسارات مختلفة",
    chip2: "🎚️ مستويات بدء",
    chip3: "📚 مراجع وتزكية",
    chip4: "🗺️ خرائط عصر ومراحل",
    level: "المستوى",
    mapLabel: "الخريطة",
    mapTitle: "اختر المرحلة التالية",
    panelTitle: "المهمة الحالية",
    panelCopy: "أكمل المرحلة الحالية للحصول على XP وفتح المرحلة التالية.",
    panelToggle: "إظهار المهمة",
    chapterOf: (i, t) => `المرحلة ${i} من ${t}`,
    rewards: ["⭐ حتى 3 نجوم", "💎 جوهرة إضافية", "🔥 سلسلة إجابات"],
    skip: "تخطي",
    next: "التالي",
    startQuiz: "ابدأ الاختبار ⚡",
    quizLabel: "اختبار المعرفة",
    correct: ["✨ ممتاز!", "🌟 إجابة صحيحة!", "💫 رائع!", "✅ أحسنت!"],
    wrong: "❌ استمر بالتعلّم!",
    perfectReady: "مكافأة المثالي",
    quick: "مكافأة السرعة",
    goal: "الهدف",
    bonus: "المكافأة",
    streakLabel: "السلسلة",
    resultTitles: ["واصل التعلّم", "أحسنت", "ممتاز جدًا"],
    correctOut: (n, t) => `${n} / ${t} صحيحة`,
    map: "الخريطة",
    retry: "إعادة",
    nextStage: "المرحلة التالية",
    gem: "جوهرة",
    streak: "سلسلة",
    rank: "رتبة",
    available: "متاح",
    complete: "مكتمل",
    locked: "مغلق",
    achievement: "إنجاز جديد",
    levelUp: "ترقية مستوى",
    popupDesc:
      "اقرأ المحتوى، انتقل بين المراحل، ثم أجب بسرعة وبدقة لتحصل على XP أعلى وتفتح محتوى أعمق.",
    begin: "▶ ابدأ المرحلة",
    replay: "🔄 إعادة المرحلة",
    story: "محتوى",
    storyDate: "التاريخ",
    storyScene: "مشهد",
    storyFocusLabel: "محور السرد",
    storyGoalLabel: "هدف المشهد",
    storyChallengeLabel: "تحدي ما قبل الاختبار",
    quiz: "اختبار",
    reward: "جائزة",
    deepFocus: "محور المرحلة",
    deepGoal: "هدف التقدّم",
    deepBooks: "للتوسّع",
    readingTitle: "قراءات أعمق",
    readingCopy: "مراجع مقترحة داخل التطبيق لإكمال الرحلة بشكل أعمق.",
    endorseTitle: "سجل القصة الزمني",
    endorseCopy:
      "بدل التزكيات، اعرض هنا محطات القصة بالتاريخ والمهام الفرعية قبل الاختبار.",
    beginner: "مبتدئ",
    intermediate: "متوسط",
    advanced: "متقدم",
    recommendedBeginner:
      "ننصحك بالبدء من المبتدئ حتى لو كنت متقدمًا أو باحثًا؛ ستستفيد من ترتيب التجربة.",
  },
  en: {
    heroKicker: "Journey of Light",
    logo: "NIBRAS",
    heroSub: "Deeper learning paths, more game-like",
    mission:
      "Choose a path, set your level, progress through a custom map, and unlock deeper content with full progress tracking and suggested references.",
    start: "▶ Choose a Path",
    demo: "★ View Achievements",
    pathsTitle: "Choose a Learning Path",
    pathsSub:
      "Start from beginner even if you are advanced. It creates better sequencing and a stronger experience. You can raise your level anytime.",
    pathsControl: "Set your start point, then choose how you want to progress.",
    pathsProgress: "Overall Progress",
    pathsCompleted: "Completed Stages",
    pathsFilterAll: "All",
    pathsFilterFresh: "New",
    pathsFilterActive: "In Progress",
    pathsFilterMastered: "Mastered",
    pathsNoResult: "No paths match this filter.",
    pathsNextQuest: "Next Quest",
    pathsEnter: "Enter Path",
    pathsFreshState: "New",
    pathsActiveState: "Active",
    pathsMasteredState: "Mastered",
    chip1: "🧭 Multiple paths",
    chip2: "🎚️ Start levels",
    chip3: "📚 References and guidance",
    chip4: "🗺️ Era-based maps",
    level: "Level",
    mapLabel: "Map",
    mapTitle: "Choose the next stage",
    panelTitle: "Current Quest",
    panelCopy: "Finish the active stage to earn XP and unlock the next one.",
    panelToggle: "Show Quest",
    chapterOf: (i, t) => `Stage ${i} of ${t}`,
    rewards: ["⭐ Up to 3 stars", "💎 Bonus gem", "🔥 Answer streak"],
    skip: "Skip",
    next: "Next",
    startQuiz: "Start Quiz ⚡",
    quizLabel: "Knowledge Check",
    correct: ["✨ Correct!", "🌟 Excellent!", "💫 Great!", "✅ Nice!"],
    wrong: "❌ Keep learning!",
    perfectReady: "Perfect Bonus",
    quick: "Quick Bonus",
    goal: "Goal",
    bonus: "Bonus",
    streakLabel: "Streak",
    resultTitles: ["Keep Going", "Well Done", "Excellent"],
    correctOut: (n, t) => `${n} / ${t} correct`,
    map: "Map",
    retry: "Retry",
    nextStage: "Next Stage",
    gem: "Gem",
    streak: "Streak",
    rank: "Rank",
    available: "Available",
    complete: "Complete",
    locked: "Locked",
    achievement: "Achievement Unlocked",
    levelUp: "Level Up",
    popupDesc:
      "Read the content, move through the stages, then answer quickly and accurately to gain more XP and unlock deeper material.",
    begin: "▶ Begin Stage",
    replay: "🔄 Replay Stage",
    story: "Content",
    storyDate: "Date",
    storyScene: "Scene",
    storyFocusLabel: "Story Focus",
    storyGoalLabel: "Scene Objective",
    storyChallengeLabel: "Pre-Quiz Challenge",
    quiz: "Quiz",
    reward: "Reward",
    deepFocus: "Stage Focus",
    deepGoal: "Progress Goal",
    deepBooks: "Go Deeper",
    readingTitle: "Deep Reading",
    readingCopy: "Suggested references inside the app for a deeper journey.",
    endorseTitle: "Story Timeline Log",
    endorseCopy:
      "Instead of endorsements, show dated story checkpoints and mini-objectives before the quiz.",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    recommendedBeginner:
      "We recommend starting from beginner even if you are advanced or a scholar; it improves sequence and experience.",
  },
};

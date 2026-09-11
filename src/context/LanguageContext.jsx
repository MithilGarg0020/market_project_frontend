import { createContext, useContext, useState, useEffect } from 'react';

export const LANGUAGES = [
  { id: 'en', name: 'English', nativeName: 'English', icon: '🇬🇧' },
  { id: 'hi', name: 'Hindi', nativeName: 'हिंदी', icon: '🇮🇳' },
  { id: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', icon: '🌾' }
];

export const TRANSLATIONS = {
  en: {
    // Brand & Nav
    brandTop: 'Sanjeev Karyana',
    brandSub: 'Stock & Wholesale Storefront',
    navOverview: 'Overview',
    navMyOrders: 'My Orders',
    navMember: 'Member',
    navCart: 'Cart',
    navTheme: 'Theme',
    navLanguage: 'Language',
    navStorefront: 'Storefront',
    paletteTitle: 'Select Palette',
    selectLanguage: 'Select Language',

    // Overview Hero
    heroEyebrow: 'Warehouse stock, at a glance',
    heroTitle: 'Agency-wise box stock for the store',
    heroDesc: "A live view of how many boxes of each agency's goods are currently in the store, with wholesale prices, box and price details, and instant box ordering available.",
    statAgencies: 'Agencies',
    statItemTypes: 'Item types',

    // Overview Sections
    agenciesTitle: 'Agencies in store',
    agenciesNote: 'Click any agency to view item-wise stock, wholesale prices, and order items',
    noAgencies: 'No agencies yet. Run npm run seed in the backend to load sample data.',
    viewStockLink: 'View stock & order items →',
    footerStore: 'Sanjeev Karyana Wholesale Store',
    footerSub: 'Wholesale stock tracking & inventory ordering',
    footerPhone: '📞 +91 98557 34450',
    footerAddress: '📍 M.k road near sugar mill dhuri',

    // Common
    loading: 'Loading…',
    loadingAgencies: 'Loading agencies…',
    loadingAgency: 'Loading agency…',
    loadingOrders: 'Loading orders…',
    outOfStock: 'Out of stock',
    lowStock: 'Low stock',
    inStock: 'In stock',
    buy: 'Buy',
    done: 'Done',
    cancel: 'Cancel',
    save: 'Save',
    search: 'Search',
    delete: 'Delete',
    close: 'Close',
    unitPiece: 'piece',
    unitPieces: 'pieces',
    box: 'box',
    boxes: 'boxes',
    bag: 'bag',
    bags: 'bags',
    looseUnits: 'Loose Units / Pieces',
    wholesaleBoxes: 'Wholesale Boxes',
    wholesaleBags: 'Wholesale Bags',

    // Agency Detail
    backOverview: '← Overview',
    itemsPricingTitle: 'Items & Wholesale Pricing',
    itemsPricingSubnote: 'Wholesale prices per box and per unit with instant ordering.',
    cardView: 'Cards',
    tableView: 'Table',
    noItemsInAgency: 'No items added for this agency yet.',
    colItem: 'Item',
    colPackaging: 'Packaging',
    colAvailable: 'Available Stock',
    colWholesaleRate: 'Wholesale Rate',
    colLoosePrice: 'Loose Unit Price',
    colAction: 'Action',
    orderStockBtn: '📦 Order Stock',

    // Buy Modal
    quickWholesaleOrder: 'Quick Wholesale Order',
    buySubtitle: 'Confirm your order quantity and buyer details below.',
    selectHowToBuy: 'Select How You Want to Buy:',
    buyByBox: 'Buy by Box',
    buyByBag: 'Buy by Bag',
    buyByUnit: 'Buy Loose Units (Pieces)',
    boxNote: 'Ideal for wholesale bulk stocking',
    bagNote: 'Bulk wholesale bag packing',
    unitNote: 'Loose pieces from opened boxes',
    quantityToOrder: 'Quantity to Order',
    pricingSummary: 'Pricing & Cost Summary',
    selectedRate: 'Selected Rate:',
    totalPayable: 'Total Payable:',
    buyerDetailsHeading: 'Buyer / Store Details',
    buyerNamePlaceholder: 'Your Name (e.g. Ramesh)',
    shopNamePlaceholder: 'Shop Name (e.g. Kumar Store)',
    phonePlaceholder: '10-digit mobile number',
    orderNotesLabel: 'Order Notes / Delivery Requests (Optional)',
    orderNotesPlaceholder: 'e.g. Urgent morning dispatch, pack safely...',
    addToCartBtn: 'Add to Cart',
    confirmDirectOrder: 'Confirm Direct Order',
    processingOrder: 'Processing Order…',
    orderSuccessTitle: '✓ Order Confirmed & Logged!',
    orderRef: 'Order Reference:',
    dateTime: 'Date & Time:',
    purchaseType: 'Purchase Type:',
    qtyOrdered: 'Quantity Ordered:',
    appliedRate: 'Applied Rate:',
    totalAmountPaid: 'Total Amount Paid:',
    remainingStock: 'Remaining Stock:',
    inWarehouse: 'in warehouse',

    // Cart Drawer
    cartTitle: 'Wholesale Cart',
    cartEmptyTitle: 'Your Cart is Empty',
    cartEmptySub: 'Add wholesale boxes or individual pieces from any agency catalog.',
    looseUnitBadge: 'Loose Unit',
    wholesaleBagBadge: 'Wholesale Bag',
    fullBoxBadge: 'Full Box',
    buyerInfoTitle: 'Member / Buyer Information:',
    autofillBtn: 'Autofill',
    memberNameLbl: 'Member / Name *',
    shopLbl: 'Shop / Business',
    phoneLbl: 'Phone / WhatsApp Number *',
    cartOrderNotesLbl: 'Order Notes & Delivery Instructions:',
    cartOrderNotesPlaceholder: 'e.g. Urgent dispatch requested, pack in dry cartons...',
    totalOrderValue: 'Total Order Value',
    clearCart: 'Clear Cart',
    placeOrder: 'Place Order',
    continueShopping: 'Continue Shopping',
    purchasedItems: 'PURCHASED ITEMS',
    grandTotalPaid: 'Grand Total Paid:',

    // My Orders
    ordersHeroEyebrow: 'Customer & Member Portal',
    ordersHeroTitle: 'My Wholesale Orders',
    guestMember: 'Guest Member',
    setMemberProfile: 'Set Member Profile',
    editProfile: 'Edit Profile',
    backStorefront: '← Back to Storefront',
    filterByPhone: 'Filter by Phone / Member:',
    phoneInputPlaceholder: 'Enter phone number (e.g. 9876543210)',
    allOrders: 'All Orders',
    searchPlaceholder: 'Search by Order ID or Product...',
    profileRequiredTitle: 'Profile Required to View Orders',
    profileRequiredDesc: 'Please set up or log in to your Member Profile to view your past wholesale orders. Orders placed by other members are kept private.',
    createProfileBtn: 'Create Member Profile',
    noOrdersFound: 'No Wholesale Orders Found',
    noOrdersSub: "You haven't placed any orders yet, or no orders match your phone number.",
    browseProductsBtn: 'Browse Products & Order',
    showingOrders: 'wholesale order',
    showingOrdersPlural: 'wholesale orders',
    statusConfirmed: '✓ Confirmed',
    statusDispatched: '🚚 Dispatched',
    statusDelivered: '★ Delivered',
    statusCancelled: '✕ Cancelled',
    placedOn: 'Placed on',
    itemDescription: 'Item Description',
    rate: 'Rate',
    qty: 'Quantity',
    subtotal: 'Subtotal',
    itemsOrdered: 'items ordered',
    grandTotal: 'Grand Total:',
    clearHistoryBtn: 'Clear Order History',

    // Member Modal
    memberModalTitle: 'Customer / Member Profile',
    memberModalSub: 'Set your details once to easily order wholesale anytime and track your orders.',
    buyerNameStar: 'Member / Buyer Name *',
    shopNameOpt: 'Shop / Business Name (Optional)',
    mobileStar: 'Mobile / WhatsApp Number *',
    mobileHelpText: 'Used to find your past order receipts and delivery updates.',
    deleteProfile: 'Delete Profile',
    saveProfile: 'Save Member Profile',
    editMemberDetails: 'Edit Member Details'
  },

  hi: {
    // Brand & Nav
    brandTop: 'संजीव करियाना',
    brandSub: 'स्टॉक एवं थोक स्टोरफ्रंट',
    navOverview: 'अवलोकन',
    navMyOrders: 'मेरे ऑर्डर्स',
    navMember: 'सदस्य',
    navCart: 'कार्ट',
    navTheme: 'थीम',
    navLanguage: 'भाषा',
    navStorefront: 'स्टोरफ्रंट',
    paletteTitle: 'कलर पैलेट चुनें',
    selectLanguage: 'भाषा चुनें',

    // Overview Hero
    heroEyebrow: 'गोदाम का स्टॉक, एक नज़र में',
    heroTitle: 'दुकान के लिए एजेंसी-वार बॉक्स स्टॉक',
    heroDesc: 'स्टोर में वर्तमान में प्रत्येक एजेंसी के सामान के कितने बॉक्स मौजूद हैं, थोक कीमतों और त्वरित बॉक्स ऑर्डरिंग के साथ लाइव दृश्य।',
    statAgencies: 'एजेंसियां',
    statItemTypes: 'आइटम प्रकार',

    // Overview Sections
    agenciesTitle: 'स्टोर में उपलब्ध एजेंसियां',
    agenciesNote: 'आइटम-वार स्टॉक, थोक मूल्य और ऑर्डर करने के लिए किसी भी एजेंसी पर क्लिक करें',
    noAgencies: 'अभी कोई एजेंसी नहीं है। सैंपल डेटा लोड करने के लिए बैकएंड में npm run seed चलाएं।',
    viewStockLink: 'स्टॉक देखें और ऑर्डर करें →',
    itemTypesCount: 'आइटम प्रकार',
    footerStore: 'संजीव करियाना थोक स्टोर',
    footerSub: 'थोक स्टॉक ट्रैकिंग और इन्वेंट्री ऑर्डरिंग',
    footerPhone: '📞 +91 98557 34450',
    footerAddress: '📍 एम.के. रोड, शुगर मिल के पास, धुरी',

    // Common
    loading: 'लोड हो रहा है…',
    loadingAgencies: 'एजेंसियां लोड हो रही हैं…',
    loadingAgency: 'एजेंसी लोड हो रही है…',
    loadingOrders: 'ऑर्डर्स लोड हो रहे हैं…',
    outOfStock: 'स्टॉक समाप्त',
    lowStock: 'कम स्टॉक',
    inStock: 'स्टॉक उपलब्ध',
    buy: 'खरीदें',
    done: 'पूर्ण',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    search: 'खोजें',
    delete: 'हटाएं',
    close: 'बंद करें',
    unitPiece: 'पीस',
    unitPieces: 'पीस',
    box: 'बॉक्स',
    boxes: 'बॉक्स',
    bag: 'बोरी / बैग',
    bags: 'बोरी / बैग',
    looseUnits: 'खुले पीस (यूनिट्स)',
    wholesaleBoxes: 'थोक बॉक्स',
    wholesaleBags: 'थोक बोरियां',

    // Agency Detail
    backOverview: '← अवलोकन',
    itemsPricingTitle: 'आइटम और थोक कीमतें',
    itemsPricingSubnote: 'प्रति बॉक्स और प्रति पीस थोक दरें एवं तुरंत ऑर्डर करने की सुविधा।',
    cardView: 'कार्ड',
    tableView: 'तालिका',
    noItemsInAgency: 'इस एजेंसी के लिए अभी तक कोई आइटम नहीं जोड़ा गया है।',
    colItem: 'आइटम',
    colPackaging: 'पैकिंग',
    colAvailable: 'उपलब्ध स्टॉक',
    colWholesaleRate: 'थोक दर',
    colLoosePrice: 'खुले पीस का भाव',
    colAction: 'कार्रवाई',
    orderStockBtn: '📦 स्टॉक ऑर्डर करें',

    // Buy Modal
    quickWholesaleOrder: 'त्वरित थोक ऑर्डर',
    buySubtitle: 'कृपया नीचे अपनी ऑर्डर मात्रा और खरीदार विवरण की पुष्टि करें।',
    selectHowToBuy: 'खरीदने का तरीका चुनें:',
    buyByBox: 'बॉक्स के अनुसार खरीदें',
    buyByBag: 'बोरी / बैग के अनुसार खरीदें',
    buyByUnit: 'खुले पीस (यूनिट) खरीदें',
    boxNote: 'थोक स्टॉक रखने के लिए उत्तम',
    bagNote: 'थोक बोरी / बैग पैकिंग',
    unitNote: 'खुले बॉक्स से व्यक्तिगत पीस',
    quantityToOrder: 'ऑर्डर करने की मात्रा',
    pricingSummary: 'मूल्य और लागत विवरण',
    selectedRate: 'चयनित दर:',
    totalPayable: 'कुल देय राशि:',
    buyerDetailsHeading: 'खरीदार / दुकान का विवरण',
    buyerNamePlaceholder: 'आपका नाम (जैसे: रमेश कुमार)',
    shopNamePlaceholder: 'दुकान का नाम (जैसे: कुमार प्रोविज़न)',
    phonePlaceholder: '10 अंकों का मोबाइल नंबर',
    orderNotesLabel: 'ऑर्डर निर्देश / नोट (वैकल्पिक)',
    orderNotesPlaceholder: 'जैसे: सुबह जल्दी डिलीवरी, सुरक्षित पैकिंग करें...',
    addToCartBtn: 'कार्ट में जोड़ें',
    confirmDirectOrder: 'सीधा ऑर्डर कन्फर्म करें',
    processingOrder: 'ऑर्डर प्रोसेस हो रहा है…',
    orderSuccessTitle: '✓ ऑर्डर सफलतापूर्वक कन्फर्म हुआ!',
    orderRef: 'ऑर्डर संदर्भ (ID):',
    dateTime: 'दिनांक व समय:',
    purchaseType: 'खरीद प्रकार:',
    qtyOrdered: 'ऑर्डर की गई मात्रा:',
    appliedRate: 'लागू दर:',
    totalAmountPaid: 'कुल भुगतान राशि:',
    remainingStock: 'शेष बचा स्टॉक:',
    inWarehouse: 'गोदाम में उपलब्ध',

    // Cart Drawer
    cartTitle: 'थोक कार्ट',
    cartEmptyTitle: 'आपकी कार्ट खाली है',
    cartEmptySub: 'किसी भी एजेंसी से थोक बॉक्स या खुले पीस कार्ट में जोड़ें।',
    looseUnitBadge: 'खुला पीस',
    wholesaleBagBadge: 'थोक बोरी',
    fullBoxBadge: 'पूरा बॉक्स',
    buyerInfoTitle: 'सदस्य / खरीदार की जानकारी:',
    autofillBtn: 'ऑटो-फिल',
    memberNameLbl: 'सदस्य / खरीदार का नाम *',
    shopLbl: 'दुकान / व्यवसाय',
    phoneLbl: 'मोबाइल / व्हाट्सएप नंबर *',
    cartOrderNotesLbl: 'ऑर्डर नोट व डिलीवरी निर्देश:',
    cartOrderNotesPlaceholder: 'जैसे: तुरंत डिस्पैच करें, सूखी जगह रखें...',
    totalOrderValue: 'कुल ऑर्डर मूल्य',
    clearCart: 'कार्ट खाली करें',
    placeOrder: 'ऑर्डर करें',
    continueShopping: 'खरीदारी जारी रखें',
    purchasedItems: 'खरीदे गए आइटम्स',
    grandTotalPaid: 'कुल भुगतान राशि:',

    // My Orders
    ordersHeroEyebrow: 'ग्राहक एवं सदस्य पोर्टल',
    ordersHeroTitle: 'मेरे थोक ऑर्डर्स',
    guestMember: 'अतिथि सदस्य',
    setMemberProfile: 'सदस्य प्रोफाइल बनाएं',
    editProfile: 'प्रोफाइल एडिट करें',
    backStorefront: '← स्टोरफ्रंट पर लौटें',
    filterByPhone: 'फोन नंबर / सदस्य द्वारा खोजें:',
    phoneInputPlaceholder: 'फोन नंबर दर्ज करें (जैसे 9876543210)',
    allOrders: 'सभी ऑर्डर्स',
    searchInResults: 'परिणामों में खोजें:',
    searchPlaceholder: 'ऑर्डर आईडी या उत्पाद नाम से खोजें...',
    profileRequiredTitle: 'ऑर्डर देखने के लिए प्रोफाइल जरूरी है',
    profileRequiredDesc: 'कृपया अपने पिछले थोक ऑर्डर देखने के लिए सदस्य प्रोफाइल बनाएं। अन्य सदस्यों के ऑर्डर सुरक्षित व निजी रखे जाते हैं।',
    createProfileBtn: 'सदस्य प्रोफाइल बनाएं',
    noOrdersFound: 'कोई थोक ऑर्डर नहीं मिला',
    noOrdersSub: 'आपने अभी तक कोई ऑर्डर नहीं दिया है, या इस फोन नंबर से कोई मेल नहीं खाता।',
    browseProductsBtn: 'उत्पाद देखें और ऑर्डर करें',
    showingOrders: 'थोक ऑर्डर',
    showingOrdersPlural: 'थोक ऑर्डर्स',
    statusConfirmed: '✓ कन्फर्म',
    statusDispatched: '🚚 रवाना (डिस्पैच्ड)',
    statusDelivered: '★ डिलीवर हो गया',
    statusCancelled: '✕ रद्द',
    placedOn: 'ऑर्डर दिनांक',
    itemDescription: 'आइटम विवरण',
    rate: 'दर',
    qty: 'मात्रा',
    subtotal: 'उप-योग',
    itemsOrdered: 'आइटम शामिल',
    grandTotal: 'कुल योग:',
    clearHistoryBtn: 'ऑर्डर इतिहास साफ़ करें',

    // Member Modal
    memberModalTitle: 'ग्राहक / सदस्य प्रोफाइल',
    memberModalSub: 'आसानी से थोक ऑर्डर करने और रिकॉर्ड रखने के लिए अपना विवरण एक बार सहेजें।',
    buyerNameStar: 'सदस्य / खरीदार का नाम *',
    shopNameOpt: 'दुकान / फर्म का नाम (वैकल्पिक)',
    mobileStar: 'मोबाइल / व्हाट्सएप नंबर *',
    mobileHelpText: 'आपके पिछले ऑर्डर रसीद और डिलीवरी अपडेट देखने के लिए उपयोग किया जाता है।',
    deleteProfile: 'प्रोफाइल हटाएं',
    saveProfile: 'सदस्य प्रोफाइल सहेजें',
    editMemberDetails: 'सदस्य विवरण बदलें (Edit Member Details)'
  },

  pa: {
    // Brand & Nav
    brandTop: 'ਸੰਜੀਵ ਕਰਿਆਨਾ',
    brandSub: 'ਸਟਾਕ ਅਤੇ ਥੋਕ ਸਟੋਰਫਰੰਟ',
    navOverview: 'ਓਵਰਵਿਊ',
    navMyOrders: 'ਮੇਰੇ ਆਰਡਰ',
    navMember: 'ਮੈਂਬਰ',
    navCart: 'ਕਾਰਟ',
    navTheme: 'ਥੀਮ',
    navLanguage: 'ਭਾਸ਼ਾ',
    navStorefront: 'ਸਟੋਰਫਰੰਟ',
    paletteTitle: 'ਰੰਗ ਪੈਲੇਟ ਚੁਣੋ',
    selectLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',

    // Overview Hero
    heroEyebrow: 'ਗੋਦਾਮ ਦਾ ਸਟਾਕ, ਇੱਕ ਨਜ਼ਰ ਵਿੱਚ',
    heroTitle: 'ਦੁਕਾਨ ਲਈ ਏਜੰਸੀ-ਵਾਰ ਪੇਟੀ (ਬਾਕਸ) ਸਟਾਕ',
    heroDesc: 'ਸਟੋਰ ਵਿੱਚ ਮੌਜੂਦਾ ਸਮੇਂ ਹਰੇਕ ਏਜੰਸੀ ਦੇ ਮਾਲ ਦੀਆਂ ਕਿੰਨੀਆਂ ਪੇਟੀਆਂ ਮੌਜੂਦ ਹਨ, ਥੋਕ ਰੇਟਾਂ ਅਤੇ ਤੁਰੰਤ ਆਰਡਰਿੰਗ ਦੇ ਨਾਲ ਲਾਈਵ ਦ੍ਰਿਸ਼।',
    statAgencies: 'ਏਜੰਸੀਆਂ',
    statItemTypes: 'ਆਈਟਮ ਕਿਸਮਾਂ',

    // Overview Sections
    agenciesTitle: 'ਸਟੋਰ ਵਿੱਚ ਉਪਲਬਧ ਏਜੰਸੀਆਂ',
    agenciesNote: 'ਆਈਟਮ-ਵਾਰ ਸਟਾਕ, ਥੋਕ ਰੇਟ ਅਤੇ ਆਰਡਰ ਕਰਨ ਲਈ ਕਿਸੇ ਵੀ ਏਜੰਸੀ ਤੇ ਕਲਿੱਕ ਕਰੋ',
    noAgencies: 'ਅਜੇ ਕੋਈ ਏਜੰਸੀ ਨਹੀਂ ਹੈ। ਨਮੂਨਾ ਡਾਟਾ ਲੋਡ ਕਰਨ ਲਈ ਬੈਕਐਂਡ ਵਿੱਚ npm run seed ਚਲਾਓ।',
    viewStockLink: 'ਸਟਾਕ ਦੇਖੋ ਅਤੇ ਆਰਡਰ ਕਰੋ →',
    itemTypesCount: 'ਆਈਟਮ ਕਿਸਮਾਂ',
    footerStore: 'ਸੰਜੀਵ ਕਰਿਆਨਾ ਹੋਲਸੇਲ ਸਟੋਰ',
    footerSub: 'ਥੋਕ ਸਟਾਕ ਟ੍ਰੈਕਿੰਗ ਅਤੇ ਆਰਡਰਿੰਗ',
    footerPhone: '📞 +91 98557 34450',
    footerAddress: '📍 ਐਮ.ਕੇ. ਰੋਡ ਨੇੜੇ ਸ਼ੂਗਰ ਮਿੱਲ, ਧੂਰੀ',

    // Common
    loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…',
    loadingAgencies: 'ਏਜੰਸੀਆਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ…',
    loadingAgency: 'ਏਜੰਸੀ ਲੋਡ ਹੋ ਰਹੀ ਹੈ…',
    loadingOrders: 'ਆਰਡਰ ਲੋਡ ਹੋ ਰਹੇ ਹਨ…',
    outOfStock: 'ਸਟਾਕ ਮੁੱਕ ਗਿਆ',
    lowStock: 'ਥੋੜ੍ਹਾ ਸਟਾਕ',
    inStock: 'ਸਟਾਕ ਮੌਜੂਦ ਹੈ',
    buy: 'ਖਰੀਦੋ',
    done: 'ਮੁਕੰਮਲ',
    cancel: 'ਰੱਦ ਕਰੋ',
    save: 'ਸੇਵ ਕਰੋ',
    search: 'ਖੋਜੋ',
    delete: 'ਮਿਟਾਓ',
    close: 'ਬੰਦ ਕਰੋ',
    unitPiece: 'ਪੀਸ',
    unitPieces: 'ਪੀਸ',
    box: 'ਪੇਟੀ (ਬਾਕਸ)',
    boxes: 'ਪੇਟੀਆਂ',
    bag: 'ਬੋਰੀ / ਥੈਲਾ',
    bags: 'ਬੋਰੀਆਂ',
    looseUnits: 'ਖੁੱਲ੍ਹੇ ਪੀਸ',
    wholesaleBoxes: 'ਥੋਕ ਪੇਟੀਆਂ',
    wholesaleBags: 'ਥੋਕ ਬੋਰੀਆਂ',

    // Agency Detail
    backOverview: '← ਓਵਰਵਿਊ',
    itemsPricingTitle: 'ਆਈਟਮਾਂ ਅਤੇ ਥੋਕ ਰੇਟ',
    itemsPricingSubnote: 'ਪ੍ਰਤੀ ਪੇਟੀ ਅਤੇ ਪ੍ਰਤੀ ਪੀਸ ਥੋਕ ਰੇਟ ਅਤੇ ਤੁਰੰਤ ਆਰਡਰ ਕਰਨ ਦੀ ਸੁਵਿਧਾ।',
    cardView: 'ਕਾਰਡ',
    tableView: 'ਟੇਬਲ',
    noItemsInAgency: 'ਇਸ ਏਜੰਸੀ ਲਈ ਅਜੇ ਕੋਈ ਆਈਟਮ ਸ਼ਾਮਲ ਨਹੀਂ ਕੀਤੀ ਗਈ ਹੈ।',
    colItem: 'ਆਈਟਮ',
    colPackaging: 'ਪੈਕਿੰਗ',
    colAvailable: 'ਉਪਲਬਧ ਸਟਾਕ',
    colWholesaleRate: 'ਥੋਕ ਰੇਟ',
    colLoosePrice: 'ਖੁੱਲ੍ਹੇ ਪੀਸ ਦਾ ਰੇਟ',
    colAction: 'ਕਾਰਵਾਈ',
    orderStockBtn: '📦 ਸਟਾਕ ਆਰਡਰ ਕਰੋ',

    // Buy Modal
    quickWholesaleOrder: 'ਤੁਰੰਤ ਥੋਕ ਆਰਡਰ',
    buySubtitle: 'ਕਿਰਪਾ ਕਰਕੇ ਹੇਠਾਂ ਆਪਣੀ ਆਰਡਰ ਮਾਤਰਾ ਅਤੇ ਗਾਹਕ ਵੇਰਵੇ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ।',
    selectHowToBuy: 'ਖਰੀਦਣ ਦਾ ਤਰੀਕਾ ਚੁਣੋ:',
    buyByBox: 'ਪੇਟੀ (ਬਾਕਸ) ਦੇ ਹਿਸਾਬ ਨਾਲ ਖਰੀਦੋ',
    buyByBag: 'ਬੋਰੀ / ਬੈਗ ਦੇ ਹਿਸਾਬ ਨਾਲ ਖਰੀਦੋ',
    buyByUnit: 'ਖੁੱਲ੍ਹੇ ਪੀਸ ਖਰੀਦੋ',
    boxNote: 'ਥੋਕ ਸਟਾਕ ਰੱਖਣ ਲਈ ਉੱਤਮ',
    bagNote: 'ਥੋਕ ਬੋਰੀ ਪੈਕਿੰਗ',
    unitNote: 'ਖੁੱਲ੍ਹੀ ਪੇਟੀ ਵਿੱਚੋਂ ਇਕੱਲੇ ਪੀਸ',
    quantityToOrder: 'ਆਰਡਰ ਕਰਨ ਦੀ ਮਾਤਰਾ',
    pricingSummary: 'ਰੇਟ ਅਤੇ ਕੁੱਲ ਰਕਮ',
    selectedRate: 'ਚੁਣਿਆ ਗਿਆ ਰੇਟ:',
    totalPayable: 'ਕੁੱਲ ਦੇਣਯੋਗ ਰਕਮ:',
    buyerDetailsHeading: 'ਗਾਹਕ / ਦੁਕਾਨ ਦਾ ਵੇਰਵਾ',
    buyerNamePlaceholder: 'ਤੁਹਾਡਾ ਨਾਮ (ਜਿਵੇਂ: ਰਮੇਸ਼ ਕੁਮਾਰ)',
    shopNamePlaceholder: 'ਦੁਕਾਨ ਦਾ ਨਾਮ (ਜਿਵੇਂ: ਕੁਮਾਰ ਪ੍ਰੋਵੀਜ਼ਨ)',
    phonePlaceholder: '10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ',
    orderNotesLabel: 'ਆਰਡਰ ਨੋਟ / ਡਿਲੀਵਰੀ ਹਦਾਇਤਾਂ (ਵਿਕਲਪਿਕ)',
    orderNotesPlaceholder: 'ਜਿਵੇਂ: ਸਵੇਰੇ ਜਲਦੀ ਡਿਲੀਵਰੀ, ਸੁਰੱਖਿਅਤ ਪੈਕਿੰਗ...',
    addToCartBtn: 'ਕਾਰਟ ਵਿੱਚ ਪਾਓ',
    confirmDirectOrder: 'ਸਿੱਧਾ ਆਰਡਰ ਕਨਫਰਮ ਕਰੋ',
    processingOrder: 'ਆਰਡਰ ਪ੍ਰੋਸੈਸ ਹੋ ਰਿਹਾ ਹੈ…',
    orderSuccessTitle: '✓ ਆਰਡਰ ਸਫਲਤਾਪੂਰਵਕ ਕਨਫਰਮ ਹੋ ਗਿਆ!',
    orderRef: 'ਆਰਡਰ ਨੰਬਰ (ID):',
    dateTime: 'ਮਿਤੀ ਅਤੇ ਸਮਾਂ:',
    purchaseType: 'ਖਰੀਦ ਦੀ ਕਿਸਮ:',
    qtyOrdered: 'ਆਰਡਰ ਕੀਤੀ ਮਾਤਰਾ:',
    appliedRate: 'ਲਾਗੂ ਰੇਟ:',
    totalAmountPaid: 'ਕੁੱਲ ਅਦਾ ਕੀਤੀ ਰਕਮ:',
    remainingStock: 'ਬਾਕੀ ਬਚਿਆ ਸਟਾਕ:',
    inWarehouse: 'ਗੋਦਾਮ ਵਿੱਚ ਮੌਜੂਦ',

    // Cart Drawer
    cartTitle: 'ਥੋਕ ਕਾਰਟ',
    cartEmptyTitle: 'ਤੁਹਾਡੀ ਕਾਰਟ ਖਾਲੀ ਹੈ',
    cartEmptySub: 'ਕਿਸੇ ਵੀ ਏਜੰਸੀ ਤੋਂ ਥੋਕ ਪੇਟੀਆਂ ਜਾਂ ਖੁੱਲ੍ਹੇ ਪੀਸ ਕਾਰਟ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰੋ।',
    looseUnitBadge: 'ਖੁੱਲ੍ਹਾ ਪੀਸ',
    wholesaleBagBadge: 'ਥੋਕ ਬੋਰੀ',
    fullBoxBadge: 'ਪੂਰੀ ਪੇਟੀ',
    buyerInfoTitle: 'ਮੈਂਬਰ / ਗਾਹਕ ਦੀ ਜਾਣਕਾਰੀ:',
    autofillBtn: 'ਆਟੋ-ਫਿਲ',
    memberNameLbl: 'ਮੈਂਬਰ / ਗਾਹਕ ਦਾ ਨਾਮ *',
    shopLbl: 'ਦੁਕਾਨ / ਕਾਰੋਬਾਰ',
    phoneLbl: 'ਮੋਬਾਈਲ / ਵਟਸਐਪ ਨੰਬਰ *',
    cartOrderNotesLbl: 'ਆਰਡਰ ਨੋਟ ਅਤੇ ਡਿਲੀਵਰੀ ਹਦਾਇਤਾਂ:',
    cartOrderNotesPlaceholder: 'ਜਿਵੇਂ: ਜਲਦੀ ਡਿਸਪੈਚ ਕਰੋ, ਸੁੱਕੇ ਗੱਤਿਆਂ ਵਿੱਚ ਰੱਖੋ...',
    totalOrderValue: 'ਕੁੱਲ ਆਰਡਰ ਮੁੱਲ',
    clearCart: 'ਕਾਰਟ ਖਾਲੀ ਕਰੋ',
    placeOrder: 'ਆਰਡਰ ਕਰੋ',
    continueShopping: 'ਖਰੀਦਦਾਰੀ ਜਾਰੀ ਰੱਖੋ',
    purchasedItems: 'ਖਰੀਦੀਆਂ ਗਈਆਂ ਆਈਟਮਾਂ',
    grandTotalPaid: 'ਕੁੱਲ ਅਦਾ ਕੀਤੀ ਰਕਮ:',

    // My Orders
    ordersHeroEyebrow: 'ਗਾਹਕ ਅਤੇ ਮੈਂਬਰ ਪੋਰਟਲ',
    ordersHeroTitle: 'ਮੇਰੇ ਥੋਕ ਆਰਡਰ',
    guestMember: 'ਮਹਿਮਾਨ ਮੈਂਬਰ',
    setMemberProfile: 'ਮੈਂਬਰ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ',
    editProfile: 'ਪ੍ਰੋਫਾਈਲ ਐਡਿਟ ਕਰੋ',
    backStorefront: '← ਸਟੋਰਫਰੰਟ ਤੇ ਵਾਪਸ ਜਾਓ',
    filterByPhone: 'ਫੋਨ ਨੰਬਰ / ਮੈਂਬਰ ਰਾਹੀਂ ਖੋਜੋ:',
    phoneInputPlaceholder: 'ਫੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ (ਜਿਵੇਂ 9876543210)',
    allOrders: 'ਸਾਰੇ ਆਰਡਰ',
    searchInResults: 'ਨਤੀਜਿਆਂ ਵਿੱਚ ਖੋਜੋ:',
    searchPlaceholder: 'ਆਰਡਰ ਆਈਡੀ ਜਾਂ ਉਤਪਾਦ ਦੇ ਨਾਮ ਨਾਲ ਖੋਜੋ...',
    profileRequiredTitle: 'ਆਰਡਰ ਦੇਖਣ ਲਈ ਪ੍ਰੋਫਾਈਲ ਜ਼ਰੂਰੀ ਹੈ',
    profileRequiredDesc: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਪਿਛਲੇ ਥੋਕ ਆਰਡਰ ਦੇਖਣ ਲਈ ਮੈਂਬਰ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ। ਹੋਰ ਮੈਂਬਰਾਂ ਦੇ ਆਰਡਰ ਸੁਰੱਖਿਅਤ ਅਤੇ ਨਿੱਜੀ ਰੱਖੇ ਜਾਂਦੇ ਹਨ।',
    createProfileBtn: 'ਮੈਂਬਰ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ',
    noOrdersFound: 'ਕੋਈ ਥੋਕ ਆਰਡਰ ਨਹੀਂ ਮਿਲਿਆ',
    noOrdersSub: 'ਤੁਸੀਂ ਅਜੇ ਤੱਕ ਕੋਈ ਆਰਡਰ ਨਹੀਂ ਦਿੱਤਾ, ਜਾਂ ਇਸ ਫੋਨ ਨੰਬਰ ਨਾਲ ਕੋਈ ਆਰਡਰ ਮੇਲ ਨਹੀਂ ਖਾਂਦਾ।',
    browseProductsBtn: 'ਉਤਪਾਦ ਦੇਖੋ ਅਤੇ ਆਰਡਰ ਕਰੋ',
    showingOrders: 'ਥੋਕ ਆਰਡਰ',
    showingOrdersPlural: 'ਥੋਕ ਆਰਡਰ',
    statusConfirmed: '✓ ਕਨਫਰਮ',
    statusDispatched: '🚚 ਰਵਾਨਾ (ਡਿਸਪੈਚਡ)',
    statusDelivered: '★ ਡਿਲੀਵਰ ਹੋ ਗਿਆ',
    statusCancelled: '✕ ਰੱਦ',
    placedOn: 'ਆਰਡਰ ਦੀ ਮਿਤੀ',
    itemDescription: 'ਆਈਟਮ ਵੇਰਵਾ',
    rate: 'ਰੇਟ',
    qty: 'ਮਾਤਰਾ',
    subtotal: 'ਜੋੜ',
    itemsOrdered: 'ਆਈਟਮਾਂ ਸ਼ਾਮਲ',
    grandTotal: 'ਕੁੱਲ ਜੋੜ:',
    clearHistoryBtn: 'ਆਰਡਰ ਇਤਿਹਾਸ ਸਾਫ਼ ਕਰੋ',

    // Member Modal
    memberModalTitle: 'ਗਾਹਕ / ਮੈਂਬਰ ਪ੍ਰੋਫਾਈਲ',
    memberModalSub: 'ਸੌਖਿਆਂ ਥੋਕ ਆਰਡਰ ਕਰਨ ਅਤੇ ਹਿਸਾਬ ਰੱਖਣ ਲਈ ਆਪਣਾ ਵੇਰਵਾ ਇੱਕ ਵਾਰ ਸੇਵ ਕਰੋ।',
    buyerNameStar: 'ਮੈਂਬਰ / ਗਾਹਕ ਦਾ ਨਾਮ *',
    shopNameOpt: 'ਦੁਕਾਨ / ਫਰਮ ਦਾ ਨਾਮ (ਵਿਕਲਪਿਕ)',
    mobileStar: 'ਮੋਬਾਈਲ / ਵਟਸਐਪ ਨੰਬਰ *',
    mobileHelpText: 'ਤੁਹਾਡੇ ਪਿਛਲੇ ਆਰਡਰ ਰਸੀਦਾਂ ਅਤੇ ਡਿਲੀਵਰੀ ਅੱਪਡੇਟ ਦੇਖਣ ਲਈ ਵਰਤਿਆ ਜਾਂਦਾ ਹੈ।',
    deleteProfile: 'ਪ੍ਰੋਫਾਈਲ ਹਟਾਓ',
    saveProfile: 'ਮੈਂਬਰ ਪ੍ਰੋਫਾਈਲ ਸੇਵ ਕਰੋ',
    editMemberDetails: 'ਮੈਂਬਰ ਵੇਰਵਾ ਬਦਲੋ (Edit Member Details)'
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('karyana_lang_v1') || 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('karyana_lang_v1', language);
    } catch (e) {
      console.error('Failed to save language preference', e);
    }
  }, [language]);

  function changeLanguage(newLang) {
    if (LANGUAGES.some((l) => l.id === newLang)) {
      setLanguage(newLang);
    }
  }

  function t(key, fallback = '') {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict[key] !== undefined) {
      return langDict[key];
    }
    const enDict = TRANSLATIONS.en;
    if (enDict[key] !== undefined) {
      return enDict[key];
    }
    return fallback || key;
  }

  const currentLangObj = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        currentLanguage: currentLangObj,
        languages: LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}

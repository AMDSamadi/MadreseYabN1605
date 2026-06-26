function findMatchingSchools(grade, gender, street, number) {

    // تبدیل اعداد فارسی و عربی به انگلیسی
    function toEnglishNumber(str) {
        return str
            .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
            .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
    }

    // یکسان‌سازی متن
    function normalize(text) {
        return toEnglishNumber(text.toString())
            .replace(/ي/g, "ی")
            .replace(/ك/g, "ک")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
    }

    const searchText = normalize(street + " " + number);

    return schoolsData.filter(school => {

        // بررسی جنسیت
        let genderOk = false;

        if (gender === "پسر") {
            genderOk = school.gender.includes("پسر");
        } else {
            genderOk = school.gender.includes("دختر");
        }

        // بررسی پایه
        let gradeOk = true;

        if (school.level && school.level.length > 0) {
            gradeOk = school.level.includes(grade);
        }

        // بررسی کوچه
        let streetOk = false;

        if (school.streets) {

            for (const s of school.streets) {

                if (normalize(s) === searchText) {
                    streetOk = true;
                    break;
                }

                if (normalize(s).includes(searchText)) {
                    streetOk = true;
                    break;
                }

            }

        }

        return genderOk && gradeOk && streetOk;

    });

}

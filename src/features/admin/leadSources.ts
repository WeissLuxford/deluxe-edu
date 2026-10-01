// Where a lead came from — a short word and a level pastel, as on the canvas.
export const LEAD_SOURCES: Record<string, { label: string; look: string }> = {
  HOME_FORM: { label: 'Сайт', look: 'b1' },
  COURSE_PAGE: { label: 'Курс', look: 'b1' },
  CONTACTS_PAGE: { label: 'Контакты', look: 'b1' },
  TRIAL_LESSON: { label: 'Пробный урок', look: 'a2' },
  LEVEL_TEST: { label: 'Тест уровня', look: 'a1' },
  LANDING: { label: 'Лендинг', look: 'b2' }
}

export const leadSource = (source: string) => LEAD_SOURCES[source] ?? LEAD_SOURCES.HOME_FORM

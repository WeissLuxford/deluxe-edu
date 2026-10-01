import { describe, expect, it } from 'vitest'
import { splitCaption } from '@/features/news/instagram'

const date = new Date('2026-09-15T10:00:00Z')

describe('splitCaption', () => {
  it('first line is the title, next paragraph the lead, the rest the body', () => {
    const r = splitCaption('Осенний набор открыт\n\nГруппы стартуют 15 сентября.\n\nЗаписывайся по ссылке в профиле.\nМест мало!', date)
    expect(r.title).toBe('Осенний набор открыт')
    expect(r.lead).toBe('Группы стартуют 15 сентября.')
    expect(r.body).toBe('Записывайся по ссылке в профиле.\nМест мало!')
  })

  it('drops trailing hashtag and mention lines', () => {
    const r = splitCaption('Speaking club в пятницу\nПриходи без подготовки\n\n#english #highgate\n@highgate.uz', date)
    expect(r.title).toBe('Speaking club в пятницу')
    expect(r.lead).toBe('Приходи без подготовки')
    expect(r.body).toBe('')
  })

  it('cuts a long first line at the first sentence', () => {
    const long = 'Мы запускаем новый курс по IELTS Writing для тех, кому нужно 7+. Занятия дважды в неделю, проверка каждого эссе преподавателем и разбор ошибок в группе.'
    const r = splitCaption(long, date)
    expect(r.title).toBe('Мы запускаем новый курс по IELTS Writing для тех, кому нужно 7+')
    expect(r.lead.startsWith('Занятия дважды в неделю')).toBe(true)
  })

  it('gives a dated title when there is no caption', () => {
    expect(splitCaption(undefined, date).title).toBe('Новость от 15 сентября')
    expect(splitCaption('#onlytags', date).title).toBe('Новость от 15 сентября')
  })
})

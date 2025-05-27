import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Формируем URL для запроса к серверу
    const serverUrl = 'http://localhost:3001/api/public/time';

    // Отправляем запрос к локальному серверу
    const response = await fetch(serverUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Проверяем тип контента ответа
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Если ответ не JSON, обрабатываем как текст
      const textResponse = await response.text();
      console.error('Сервер вернул не JSON:', textResponse.substring(0, 200));
      return NextResponse.json(
        { message: 'Сервер вернул некорректный формат данных' },
        { status: 500 }
      );
    }
    
    // Получаем ответ как JSON
    const data = await response.json();

    // Если ответ не успешный, возвращаем ошибку
    if (!response.ok) {
      console.error('Ошибка при получении серверного времени:', data);
      return NextResponse.json(
        { message: data.message || 'Ошибка при получении серверного времени' },
        { status: response.status }
      );
    }

    // Возвращаем успешный ответ
    return NextResponse.json(data);
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

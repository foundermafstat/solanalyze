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
      console.error('Server returned non-JSON:', textResponse.substring(0, 200));
      return NextResponse.json(
        { message: 'Server returned incorrect data format' },
        { status: 500 }
      );
    }
    
    // Получаем ответ как JSON
    const data = await response.json();

    // Если ответ не успешный, возвращаем ошибку
    if (!response.ok) {
      console.error('Error getting server time:', data);
      return NextResponse.json(
        { message: data.message || 'Error getting server time' },
        { status: response.status }
      );
    }

    // Возвращаем успешный ответ
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error during request execution:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

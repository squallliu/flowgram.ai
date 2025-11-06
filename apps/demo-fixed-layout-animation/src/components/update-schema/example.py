#!/usr/bin/env python3
"""
Weather-based Clothing Advisor using LangGraph
A workflow that fetches weather data and provides clothing recommendations.
"""

import json
import re
import requests
from typing import Dict, Any, Optional, TypedDict
from dataclasses import dataclass
from langgraph.graph import Graph, StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
import os


# State definition for the workflow
class WorkflowState(TypedDict):
    """State structure for the weather clothing advisor workflow"""
    city_name: str
    validated_city: str
    weather_data: Dict[str, Any]
    temperature: float
    weather_condition: str
    clothing_suggestion: str
    final_response: str
    error_message: Optional[str]


@dataclass
class WeatherInfo:
    """Weather information data structure"""
    temperature: float
    condition: str
    humidity: int
    wind_speed: float
    description: str


class WeatherClothingAdvisor:
    """Main class for the weather-based clothing advisor workflow"""

    def __init__(self, openai_api_key: Optional[str] = None):
        """
        Initialize the advisor with OpenAI API key

        Args:
            openai_api_key: OpenAI API key for LLM calls
        """
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        if self.openai_api_key:
            self.llm = ChatOpenAI(
                api_key=self.openai_api_key,
                model="gpt-3.5-turbo",
                temperature=0.7
            )
        else:
            self.llm = None
            print("Warning: No OpenAI API key provided. Using rule-based suggestions.")

    def validate_city_input(self, state: WorkflowState) -> WorkflowState:
        """
        Node 1: Input processing and validation
        Validates and cleans the city name input

        Args:
            state: Current workflow state

        Returns:
            Updated state with validated city name
        """
        city_name = state.get("city_name", "").strip()

        # Basic validation
        if not city_name:
            state["error_message"] = "城市名称不能为空"
            return state

        # Remove special characters and normalize
        validated_city = re.sub(r'[^\w\s-]', '', city_name)
        validated_city = validated_city.strip()

        if len(validated_city) < 2:
            state["error_message"] = "请输入有效的城市名称"
            return state

        state["validated_city"] = validated_city
        state["error_message"] = None

        print(f"✓ 城市名称验证通过: {validated_city}")
        return state

    def fetch_weather_data(self, state: WorkflowState) -> WorkflowState:
        """
        Node 2: Weather data retrieval
        Fetches weather information from wttr.in API

        Args:
            state: Current workflow state

        Returns:
            Updated state with weather data
        """
        if state.get("error_message"):
            return state

        validated_city = state["validated_city"]

        try:
            # Use wttr.in API for weather data
            url = f"http://wttr.in/{validated_city}?format=j1"
            headers = {
                'User-Agent': 'WeatherClothingAdvisor/1.0'
            }

            print(f"🌤️  正在获取 {validated_city} 的天气数据...")
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()

            weather_data = response.json()

            # Extract current weather information
            current_condition = weather_data["current_condition"][0]
            temperature_c = float(current_condition["temp_C"])
            weather_desc = current_condition["weatherDesc"][0]["value"]
            humidity = int(current_condition["humidity"])
            wind_speed = float(current_condition["windspeedKmph"])

            state["weather_data"] = weather_data
            state["temperature"] = temperature_c
            state["weather_condition"] = weather_desc

            weather_info = WeatherInfo(
                temperature=temperature_c,
                condition=weather_desc,
                humidity=humidity,
                wind_speed=wind_speed,
                description=f"{temperature_c}°C, {weather_desc}, 湿度 {humidity}%, 风速 {wind_speed}km/h"
            )

            print(f"✓ 天气数据获取成功: {weather_info.description}")

        except requests.exceptions.RequestException as e:
            state["error_message"] = f"获取天气数据失败: {str(e)}"
            print(f"❌ 天气数据获取失败: {str(e)}")
        except (KeyError, ValueError, IndexError) as e:
            state["error_message"] = f"天气数据解析失败: {str(e)}"
            print(f"❌ 天气数据解析失败: {str(e)}")

        return state

    def generate_clothing_suggestion(self, state: WorkflowState) -> WorkflowState:
        """
        Node 3: Clothing suggestion generation
        Generates clothing recommendations based on weather data

        Args:
            state: Current workflow state

        Returns:
            Updated state with clothing suggestions
        """
        if state.get("error_message"):
            return state

        temperature = state["temperature"]
        weather_condition = state["weather_condition"]
        city_name = state["validated_city"]

        print(f"🧥 正在生成穿衣建议...")

        if self.llm:
            # Use LLM for intelligent suggestions
            try:
                prompt = f"""
                作为一个专业的穿衣顾问，请根据以下天气信息为用户提供详细的穿衣建议：

                城市：{city_name}
                温度：{temperature}°C
                天气状况：{weather_condition}

                请提供：
                1. 上身穿着建议
                2. 下身穿着建议
                3. 外套建议
                4. 配饰建议（如帽子、围巾等）
                5. 鞋子建议
                6. 特别注意事项

                请用简洁明了的中文回答，语气友好自然。
                """

                messages = [
                    SystemMessage(content="你是一个专业的穿衣顾问，擅长根据天气情况提供实用的穿衣建议。"),
                    HumanMessage(content=prompt)
                ]

                response = self.llm.invoke(messages)
                state["clothing_suggestion"] = response.content

            except Exception as e:
                print(f"⚠️  LLM调用失败，使用规则建议: {str(e)}")
                state["clothing_suggestion"] = self._get_rule_based_suggestion(temperature, weather_condition)
        else:
            # Use rule-based suggestions
            state["clothing_suggestion"] = self._get_rule_based_suggestion(temperature, weather_condition)

        print("✓ 穿衣建议生成完成")
        return state

    def _get_rule_based_suggestion(self, temperature: float, weather_condition: str) -> str:
        """
        Generate rule-based clothing suggestions

        Args:
            temperature: Temperature in Celsius
            weather_condition: Weather condition description

        Returns:
            Clothing suggestion string
        """
        suggestions = []

        # Temperature-based suggestions
        if temperature < 0:
            suggestions.append("🧥 上身：保暖内衣 + 毛衣 + 厚外套")
            suggestions.append("👖 下身：保暖裤 + 厚裤子")
            suggestions.append("🧤 配饰：帽子、围巾、手套必备")
        elif temperature < 10:
            suggestions.append("🧥 上身：长袖衬衫 + 毛衣 + 外套")
            suggestions.append("👖 下身：长裤")
            suggestions.append("🧣 配饰：围巾、帽子")
        elif temperature < 20:
            suggestions.append("👔 上身：长袖衬衫 + 薄外套")
            suggestions.append("👖 下身：长裤或牛仔裤")
            suggestions.append("🧢 配饰：可选择轻薄围巾")
        elif temperature < 25:
            suggestions.append("👕 上身：长袖T恤或薄衬衫")
            suggestions.append("👖 下身：长裤或休闲裤")
        else:
            suggestions.append("👕 上身：短袖T恤或薄衬衫")
            suggestions.append("🩳 下身：短裤或薄长裤")
            suggestions.append("🧴 注意：防晒和补水")

        # Weather condition adjustments
        weather_lower = weather_condition.lower()
        if any(word in weather_lower for word in ['rain', 'shower', '雨', '阵雨']):
            suggestions.append("☔ 特别提醒：携带雨伞或穿防水外套")
        elif any(word in weather_lower for word in ['snow', '雪']):
            suggestions.append("❄️ 特别提醒：穿防滑鞋，注意保暖")
        elif any(word in weather_lower for word in ['wind', '风']):
            suggestions.append("💨 特别提醒：选择防风外套")

        # Shoe suggestions
        if temperature < 5:
            suggestions.append("👢 鞋子：保暖靴子或厚底鞋")
        elif temperature > 25:
            suggestions.append("👟 鞋子：透气运动鞋或凉鞋")
        else:
            suggestions.append("👟 鞋子：舒适的运动鞋或休闲鞋")

        return "\n".join(suggestions)

    def format_final_response(self, state: WorkflowState) -> WorkflowState:
        """
        Node 4: Output formatting
        Formats the final response with weather info and clothing suggestions

        Args:
            state: Current workflow state

        Returns:
            Updated state with formatted final response
        """
        if state.get("error_message"):
            state["final_response"] = f"❌ 错误：{state['error_message']}"
            return state

        city_name = state["validated_city"]
        temperature = state["temperature"]
        weather_condition = state["weather_condition"]
        clothing_suggestion = state["clothing_suggestion"]

        final_response = f"""
🌍 {city_name} 天气穿衣建议

📊 当前天气情况：
• 温度：{temperature}°C
• 天气：{weather_condition}

👔 穿衣建议：
{clothing_suggestion}

💡 温馨提示：
建议出门前再次确认天气变化，根据个人体感适当调整穿着。
        """.strip()

        state["final_response"] = final_response
        print("✓ 最终回答格式化完成")

        return state

    def create_workflow(self) -> StateGraph:
        """
        Create and configure the LangGraph workflow

        Returns:
            Configured StateGraph workflow
        """
        # Create the graph
        workflow = StateGraph(WorkflowState)

        # Add nodes
        workflow.add_node("validate_input", self.validate_city_input)
        workflow.add_node("fetch_weather", self.fetch_weather_data)
        workflow.add_node("generate_suggestion", self.generate_clothing_suggestion)
        workflow.add_node("format_response", self.format_final_response)

        # Define the flow
        workflow.set_entry_point("validate_input")

        # Add conditional edges
        workflow.add_conditional_edges(
            "validate_input",
            lambda state: "fetch_weather" if not state.get("error_message") else "format_response"
        )

        workflow.add_conditional_edges(
            "fetch_weather",
            lambda state: "generate_suggestion" if not state.get("error_message") else "format_response"
        )

        workflow.add_conditional_edges(
            "generate_suggestion",
            lambda state: "format_response" if not state.get("error_message") else "format_response"
        )

        workflow.add_edge("format_response", END)

        return workflow.compile()

    def get_clothing_advice(self, city_name: str) -> str:
        """
        Main method to get clothing advice for a city

        Args:
            city_name: Name of the city to get weather and clothing advice for

        Returns:
            Formatted clothing advice string
        """
        print(f"🚀 开始为 '{city_name}' 生成穿衣建议...")

        # Create and run the workflow
        workflow = self.create_workflow()

        # Initial state
        initial_state = WorkflowState(
            city_name=city_name,
            validated_city="",
            weather_data={},
            temperature=0.0,
            weather_condition="",
            clothing_suggestion="",
            final_response="",
            error_message=None
        )

        # Execute the workflow
        result = workflow.invoke(initial_state)

        return result["final_response"]


def main():
    """Main function to demonstrate the weather clothing advisor"""
    print("🌤️ 天气穿衣建议助手")
    print("=" * 50)

    # Initialize the advisor
    advisor = WeatherClothingAdvisor()

    # Example usage
    cities = ["北京", "上海", "广州", "深圳"]

    for city in cities:
        print(f"\n{'='*20} {city} {'='*20}")
        try:
            advice = advisor.get_clothing_advice(city)
            print(advice)
        except Exception as e:
            print(f"❌ 处理 {city} 时出错: {str(e)}")
        print("\n" + "-" * 60)

    # Interactive mode
    print("\n🎯 交互模式 (输入 'quit' 退出)")
    while True:
        try:
            city_input = input("\n请输入城市名称: ").strip()
            if city_input.lower() in ['quit', 'exit', '退出', 'q']:
                print("👋 再见！")
                break

            if city_input:
                advice = advisor.get_clothing_advice(city_input)
                print(f"\n{advice}")
            else:
                print("❌ 请输入有效的城市名称")

        except KeyboardInterrupt:
            print("\n👋 再见！")
            break
        except Exception as e:
            print(f"❌ 出现错误: {str(e)}")


if __name__ == "__main__":
    main()
